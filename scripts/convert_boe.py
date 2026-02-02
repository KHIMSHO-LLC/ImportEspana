#!/usr/bin/env python3
"""
BOE XML to JSON Converter for ImportEspana
Converts official Spanish vehicle fiscal values from BOE XML to clean JSON database.

Usage:
    python scripts/convert_boe.py
"""

import xml.etree.ElementTree as ET
import json
import re
from pathlib import Path


def clean_value(value_str):
    """
    Clean the value string and convert to integer.
    Example: "33.400" -> 33400
    """
    if not value_str or value_str.strip() == "":
        return None
    # Remove dots (thousand separators) and convert to int
    cleaned = value_str.replace(".", "").strip()
    try:
        return int(cleaned)
    except ValueError:
        return None


def extract_text(element):
    """
    Extract text from element, handling nested <p> tags.
    """
    if element is None:
        return ""
    
    # Try to get text from nested <p> tag first
    p_tag = element.find(".//p")
    if p_tag is not None and p_tag.text:
        return p_tag.text.strip()
    
    # Otherwise get direct text
    if element.text:
        return element.text.strip()
    
    return ""


def generate_id(brand, model, cv):
    """
    Generate a unique ID for each vehicle.
    Format: brand_model_cv (all lowercase, spaces to underscores)
    """
    # Clean and normalize
    brand_clean = brand.lower().replace(" ", "_").replace("-", "_")
    model_clean = model.lower().replace(" ", "_").replace("-", "_").replace("/", "_")
    model_clean = re.sub(r'[^\w_]', '', model_clean)  # Remove special chars
    
    return f"{brand_clean}_{model_clean}_{cv}cv"


def parse_boe_xml(xml_path):
    """
    Parse the BOE XML file and extract vehicle data.
    """
    print(f"📖 Reading XML file: {xml_path}")
    tree = ET.parse(xml_path)
    root = tree.getroot()
    
    vehicles = []
    table_count = 0
    vehicle_count = 0
    
    # Find all tables with class="tabla_ancha"
    tables = root.findall('.//table[@class="tabla_ancha"]')
    print(f"📊 Found {len(tables)} brand tables")
    
    for table in tables:
        # Extract brand from header
        brand_header = table.find('.//thead/tr/th[@class="cabeza_tabla"]')
        if brand_header is None:
            continue
        
        brand_text = extract_text(brand_header)
        if not brand_text.startswith("Marca:"):
            continue
        
        # Extract brand name (e.g., "Marca: ABARTH" -> "ABARTH")
        brand = brand_text.replace("Marca:", "").strip()
        table_count += 1
        
        print(f"  🚗 Processing brand: {brand}")
        
        # Extract all vehicle rows from tbody
        tbody = table.find('.//tbody')
        if tbody is None:
            continue
        
        rows = tbody.findall('.//tr')
        brand_vehicle_count = 0
        
        for row in rows:
            cells = row.findall('.//td')
            if len(cells) < 10:
                continue  # Skip malformed rows
            
            # Extract data from columns
            model = extract_text(cells[0])
            start_year = extract_text(cells[1])
            end_year = extract_text(cells[2])
            cc = extract_text(cells[3])
            cylinders = extract_text(cells[4])
            fuel_type = extract_text(cells[5])
            kw = extract_text(cells[6])
            cvf = extract_text(cells[7])
            cv_str = extract_text(cells[8])
            value_str = extract_text(cells[9])
            
            # Clean and convert values
            value = clean_value(value_str)
            if value is None:
                continue  # Skip if no valid value
            
            try:
                cv = int(cv_str) if cv_str else 0
            except ValueError:
                cv = 0
            
            # Generate unique ID
            vehicle_id = generate_id(brand, model, cv)
            
            # Create vehicle object
            vehicle = {
                "id": vehicle_id,
                "brand": brand,
                "model": model,
                "startYear": start_year,
                "endYear": end_year if end_year else None,
                "cc": cc,
                "cylinders": cylinders,
                "fuelType": fuel_type,
                "kw": kw,
                "cvf": cvf,
                "cv": cv,
                "value": value
            }
            
            vehicles.append(vehicle)
            brand_vehicle_count += 1
            vehicle_count += 1
        
        print(f"    ✅ Extracted {brand_vehicle_count} vehicles")
    
    print(f"\n✨ Total: {table_count} brands, {vehicle_count} vehicles")
    return vehicles


def save_json(vehicles, output_path):
    """
    Save vehicles to JSON file.
    """
    # Ensure output directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    print(f"\n💾 Saving to: {output_path}")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(vehicles, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Saved {len(vehicles)} vehicles to JSON")


def main():
    """
    Main conversion function.
    """
    # Paths
    project_root = Path(__file__).parent.parent
    xml_path = project_root / "assets" / "boe_2026.xml"
    json_path = project_root / "src" / "data" / "boe_prices.json"
    
    if not xml_path.exists():
        print(f"❌ Error: XML file not found at {xml_path}")
        return
    
    # Parse and convert
    vehicles = parse_boe_xml(xml_path)
    
    # Save to JSON
    save_json(vehicles, json_path)
    
    # Print sample
    print("\n📋 Sample vehicles:")
    for vehicle in vehicles[:3]:
        print(f"  - {vehicle['brand']} {vehicle['model']} ({vehicle['cv']}cv) = €{vehicle['value']:,}")
    
    print("\n🎉 Conversion complete!")


if __name__ == "__main__":
    main()
