import json
from pathlib import Path
from collections import defaultdict

def analyze_inconsistencies():
    json_path = Path('src/data/boe_prices.json')
    if not json_path.exists():
        print("❌ valid json file found")
        return

    with open(json_path, 'r') as f:
        cars = json.load(f)

    print(f"🔍 Analyzing {len(cars)} cars for inconsistent naming...")

    # Group by Brand
    cars_by_brand = defaultdict(set)
    for car in cars:
        cars_by_brand[car['brand']].add(car['model'])

    inconsistencies_found = 0

    for brand, models in cars_by_brand.items():
        # Create a map of normalized_name -> list of original_names
        # Normalization: lower case, remove spaces, remove hyphens
        normalized_map = defaultdict(list)
        
        for model in models:
            # We want to catch things like "M-4" vs "M4", "C 220" vs "C220"
            normalized = model.lower().replace(" ", "").replace("-", "")
            normalized_map[normalized].append(model)

        # distinct_models_count = len(models)
        
        # Check for collisions (where 1 normalized name maps to >1 original names)
        brand_issues = []
        for norm, originals in normalized_map.items():
            if len(originals) > 1:
                # Filter out cases where the only difference is case
                # We do this by checking if the set of lowercased originals has size > 1
                # If they all lowercase to the same string, then it's just a case difference (e.g. "Sport" vs "SPORT")
                # But wait, 'norm' is already lowercased and spaces removed.
                # So we need to check if the originals are actually different strings.
                unique_originals = sorted(list(set(originals)))
                
                # Check if checking lower() makes them identical
                lower_originals = set(o.lower() for o in unique_originals)
                
                # If there are >1 distinct lowercased versions, OR if they differ by spacing/punctuation
                # actually, 'norm' has removed spaces and hyphens.
                # So if we have "V 70" and "V70", norm is "v70". Lowercase comparison won't catch it.
                # We WANT to see "V 70" vs "V70". We DON'T want "Sport" vs "SPORT".
                
                # Let's filter: if the ONLY difference is case, skip it.
                is_only_case_diff = len(set(o.lower() for o in unique_originals)) == 1
                is_spacing_diff = len(set(o.replace(" ", "") for o in unique_originals)) == 1
                
                if not is_only_case_diff:
                     brand_issues.append(unique_originals)
                elif not is_spacing_diff: # Same chars, different spaces (e.g. "V 70" vs "V70" -> lower: "v 70", "v70")
                     # wait, if is_only_case_diff is True, then "V 70" and "V70" would be distinct in lower()
                     # Ah: "V 70".lower() -> "v 70". "V70".lower() -> "v70". They are diff.
                     pass
                     
                # Simpler logic:
                # We strictly want to ignore if lower() remains identical.
                # "M-4" vs "M4" -> lower: "m-4", "m4" (Different -> SHOW)
                # "Sport" vs "SPORT" -> lower: "sport", "sport" (Same -> HIDE)
                
                distinct_lower = set(o.lower() for o in unique_originals)
                if len(distinct_lower) > 1:
                    brand_issues.append(unique_originals)

        if brand_issues:
            print(f"\nExample Inconsistencies for **{brand}**:")
            for group in brand_issues[:5]: # Show top 5 examples per brand to avoid spam
                print(f"  - Variation: {sorted(group)}")
            
            check_count = len(brand_issues)
            if check_count > 5:
                print(f"  ... and {check_count - 5} more sets.")
            
            inconsistencies_found += check_count

    print(f"\n\n✨ Analysis Complete. Found {inconsistencies_found} potential inconsistency sets.")

if __name__ == "__main__":
    analyze_inconsistencies()
