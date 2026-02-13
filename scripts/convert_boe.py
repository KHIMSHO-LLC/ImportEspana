import xml.etree.ElementTree as ET
import json
import re
import hashlib
from pathlib import Path
import os

# CONFIGURATION
# Assuming script is run from project root
INPUT_FILE = 'assets/boe_2026.xml'  
OUTPUT_FILE = 'src/data/boe_prices.json'

def parse_boe_xml(xml_file):
    print(f"📂 Opening {xml_file}...")
    
    try:
        tree = ET.parse(xml_file)
        root = tree.getroot()
    except ET.ParseError as e:
        print(f"❌ XML Parse Error: {e}")
        return

    cars = []
    
    # Helper to clean text (removes newlines, extra spaces)
    def clean_text(element):
        if element is None:
            return ""
        # Sometimes text is inside the tag, sometimes inside a <p> child
        text = "".join(element.itertext())
        return " ".join(text.split())

    # Helper to parse Euro numbers "33.400" -> 33400
    def parse_money(text):
        if not text: return 0
        clean = text.replace('.', '').replace(',', '.')
        try:
            return int(float(clean))
        except ValueError:
            return 0

    # Helper to create a deterministic ID (so it's the same every time you run script)
    def generate_id(data_string):
        return hashlib.md5(data_string.encode('utf-8')).hexdigest()[:12]

    # Find all tables
    tables = root.findall(".//table")
    print(f"� Found {len(tables)} tables. Processing...")

    for table in tables:
        # 1. EXTRACT BRAND from THEAD
        brand = "Unknown"
        thead = table.find("thead")
        if thead:
            header_row = thead.find("tr")
            if header_row:
                header_text = clean_text(header_row)
                # Look for "Marca: [BRAND]"
                match = re.search(r"Marca:\s*(.+)", header_text, re.IGNORECASE)
                if match:
                    brand = match.group(1).strip()
        
        # Skip if no brand found (likely not a car table)
        if brand == "Unknown":
            continue

        # 2. PROCESS ROWS in TBODY
        tbody = table.find("tbody")
        if not tbody:
            continue

        for row in tbody.findall("tr"):
            cols = row.findall("td")
            
            # Ensure we have enough columns (Car tables usually have 10 cols)
            if len(cols) < 8:
                continue

            try:
                # Extract Raw Data
                model = clean_text(cols[0])
                start_year = clean_text(cols[1])
                end_year = clean_text(cols[2])
                cc = clean_text(cols[3])
                cylinders = clean_text(cols[4])
                fuel = clean_text(cols[5])
                kw = clean_text(cols[6])
                cvf = clean_text(cols[7])
                cv = clean_text(cols[8])
                value_raw = clean_text(cols[9])
                
                # Convert Numbers
                value = parse_money(value_raw)
                
                # Create the Car Object
                car = {
                    "brand": brand,
                    "model": model,
                    "startYear": start_year,
                    "endYear": end_year,
                    "cc": cc,
                    "cylinders": cylinders,
                    "fuel": fuel,
                    "kw": kw,
                    "cvf": cvf,
                    "cv": cv,
                    "value": value
                }

                # Normalize Model Name (Fix BOE inconsistencies)
                # 1. BMW M-Series: "M-4" -> "M4", "M-3" -> "M3"
                if car["brand"] == "BMW":
                    car["model"] = car["model"].replace("M-", "M")
                
                # 2. Toyota Land Cruiser / RAV4: "D4-D" -> "D-4D", "RAV-4" -> "RAV4"
                if car["brand"] == "TOYOTA":
                    car["model"] = car["model"].replace("D4-D", "D-4D").replace("D4D", "D-4D") # Standardize D-4D
                    car["model"] = car["model"].replace("RAV-4", "RAV4")

                # 3. SsangYong: "270 XVT" -> "270XVT" (remove space) to match
                if car["brand"] == "SSANGYONG" or car["brand"] == "SSANYONG": # BOE has typos in brand sometimes too
                    car["model"] = car["model"].replace("270 XVT", "270XVT")

                # 4. Volvo: "V 70" -> "V70", "S 60" -> "S60", etc.
                if car["brand"] == "VOLVO":
                    # Fix V 40, V 50, V 60, V 70, V 90, S 40, S 60, S 80, S 90, XC 60, XC 70, XC 90
                    # Regex substitution might be cleaner but manual replace is safer and explicit
                    for series in ["V", "S", "XC", "C"]:
                        car["model"] = car["model"].replace(f"{series} ", series)

                # 5. Peugeot/Citroen/Ford: "1.6 HDI" vs "1.6HDI"
                # Use a generic fix for common engine spacings if safe
                # Fix specific Peugeot "1.6 HDI" -> "1.6HDI" to match majority if needed, OR vise versa.
                # Actually, standardizing WITH space is better for readability.
                # "1.6HDI" -> "1.6 HDI"
                car["model"] = car["model"].replace("1.6HDI", "1.6 HDI")
                car["model"] = car["model"].replace("2.0TDI", "2.0 TDI") # VW/Seat/Audi
                car["model"] = car["model"].replace("1.9TDI", "1.9 TDI")
                
                # 6. General capitalization fix (Title Case)
                # Many entries are ALL CAPS or mixed. We standardize to Title Case for display
                # BUT we need to be careful with acronyms like "TDI", "GTI", "BMW"
                # For now, simplest is to just strip extra whitespace. 
                # Converting to title case globally might break "D-4D" into "D-4d".
                # So we leave case as is for safety, or we could apply a smart formatter later.
                car["model"] = " ".join(car["model"].split()) # Remove extra spaces
                
                # Generate a Unique ID based on ALL fields to prevent overwriting
                # (e.g. "BMW M4 2017" will have different ID than "BMW M4 2019")
                unique_string = f"{brand}-{model}-{start_year}-{end_year}-{cv}-{value}"
                car["id"] = generate_id(unique_string)

                cars.append(car)

            except Exception as e:
                print(f"⚠️ Skipped row: {e}")
                continue

    # 3. SAVE TO JSON
    print(f"✅ Extracted {len(cars)} cars.")
    # Define output paths
    rn_output_path = Path("src/data/boe_prices.json")
    web_output_path = Path("../ImportEspanaWeb/src/data/boe_prices.json")
    
    # Save to React Native Project
    rn_output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(rn_output_path, 'w', encoding='utf-8') as f:
        json.dump(cars, f, ensure_ascii=False, indent=4)
        print(f"💾 Saved to {rn_output_path}")

    # Save to Web Project
    if web_output_path.parent.exists():
        with open(web_output_path, 'w', encoding='utf-8') as f:
            json.dump(cars, f, ensure_ascii=False, indent=4)
            print(f"💾 Saved to {web_output_path}")
    else:
        print(f"⚠️ Web project path not found: {web_output_path}")

if __name__ == "__main__":
    parse_boe_xml(INPUT_FILE)
