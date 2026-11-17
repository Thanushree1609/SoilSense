
def classify_nutrient(value, low_limit, high_limit):
    if value < low_limit:
        return "Low"
    elif value <= high_limit:
        return "Medium"
    else:
        return "High"


def classify_ph(value):
    if value < 6.5:
        return "Acidic"
    elif value <= 7.5:
        return "Near Neutral"
    else:
        return "Alkaline"


def get_soil_improvement_suggestions(
    nitrogen_status,
    phosphorus_status,
    potassium_status,
    ph_status,
    organic_carbon_status
):
    suggestions = []

    # Nitrogen suggestions
    if nitrogen_status == "Low":
        suggestions.append({
            "parameter": "Nitrogen",
            "status": "Low",
            "suggestion": [
                "Consider well-decomposed farmyard manure or compost.",
                "Legume crops and green manuring can help improve soil nitrogen.",
                "Follow soil-test-based nitrogen fertilizer recommendations."
            ]
        })
    elif nitrogen_status == "High":
        suggestions.append({
            "parameter": "Nitrogen",
            "status": "High",
            "suggestion": [
                "Avoid unnecessary additional nitrogen fertilizer.",
                "Follow crop-specific nutrient recommendations.",
                "Avoid excessive nitrogen application to reduce nutrient losses."
            ]
        })
    else:
        suggestions.append({
            "parameter": "Nitrogen",
            "status": "Medium",
            "suggestion": [
                "Maintain balanced nutrient management.",
                "Monitor nitrogen levels through periodic soil testing."
            ]
        })

    # Phosphorus suggestions
    if phosphorus_status == "Low":
        suggestions.append({
            "parameter": "Phosphorus",
            "status": "Low",
            "suggestion": [
                "Consider phosphorus-containing fertilizers based on soil-test recommendations.",
                "Maintain organic matter through compost or farmyard manure.",
                "Avoid applying excess phosphorus."
            ]
        })
    elif phosphorus_status == "High":
        suggestions.append({
            "parameter": "Phosphorus",
            "status": "High",
            "suggestion": [
                "Avoid unnecessary phosphorus fertilizer application.",
                "Use existing soil phosphorus efficiently.",
                "Monitor phosphorus levels through periodic testing."
            ]
        })
    else:
        suggestions.append({
            "parameter": "Phosphorus",
            "status": "Medium",
            "suggestion": [
                "Maintain balanced phosphorus management.",
                "Apply phosphorus according to crop requirements."
            ]
        })

    # Potassium suggestions
    if potassium_status == "Low":
        suggestions.append({
            "parameter": "Potassium",
            "status": "Low",
            "suggestion": [
                "Consider potassium-containing fertilizers based on soil-test recommendations.",
                "Return suitable crop residues to the soil.",
                "Maintain soil organic matter."
            ]
        })
    elif potassium_status == "High":
        suggestions.append({
            "parameter": "Potassium",
            "status": "High",
            "suggestion": [
                "Avoid unnecessary potassium fertilizer application.",
                "Monitor potassium levels during future soil tests."
            ]
        })
    else:
        suggestions.append({
            "parameter": "Potassium",
            "status": "Medium",
            "suggestion": [
                "Maintain balanced potassium management.",
                "Continue regular soil testing."
            ]
        })

    # pH suggestions
    if ph_status == "Acidic":
        suggestions.append({
            "parameter": "Soil pH",
            "status": "Acidic",
            "suggestion": [
                "Agricultural lime may help correct soil acidity.",
                "Determine lime requirement through a soil test before application.",
                "Choose crops suitable for the existing soil pH."
            ]
        })
    elif ph_status == "Alkaline":
        suggestions.append({
            "parameter": "Soil pH",
            "status": "Alkaline",
            "suggestion": [
                "Check soil salinity and irrigation water quality.",
                "Use soil-test-based amendments where appropriate.",
                "Avoid applying gypsum or other amendments without diagnosing the cause of alkalinity."
            ]
        })
    else:
        suggestions.append({
            "parameter": "Soil pH",
            "status": "Near Neutral",
            "suggestion": [
                "Maintain the current soil pH through balanced soil management.",
                "Avoid unnecessary pH-altering amendments."
            ]
        })

    # Organic Carbon suggestions
    if organic_carbon_status == "Low":
        suggestions.append({
            "parameter": "Organic Carbon",
            "status": "Low",
            "suggestion": [
                "Add compost or well-decomposed farmyard manure.",
                "Grow cover crops and use green manuring.",
                "Return suitable crop residues to the soil."
            ]
        })
    elif organic_carbon_status == "High":
        suggestions.append({
            "parameter": "Organic Carbon",
            "status": "High",
            "suggestion": [
                "Continue practices that maintain soil organic matter.",
                "Monitor soil nutrient availability through regular testing."
            ]
        })
    else:
        suggestions.append({
            "parameter": "Organic Carbon",
            "status": "Medium",
            "suggestion": [
                "Maintain organic matter using compost and crop residues.",
                "Use cover crops where practical."
            ]
        })

    return suggestions


def analyze_soil(data):
    nitrogen_status = classify_nutrient(data.nitrogen, 280, 560)
    phosphorus_status = classify_nutrient(data.phosphorus, 10, 24.6)
    potassium_status = classify_nutrient(data.potassium, 108, 280)
    organic_carbon_status = classify_nutrient(
        data.organic_carbon, 0.5, 0.75
    )
    ph_status = classify_ph(data.ph)

    nutrient_statuses = [
        nitrogen_status,
        phosphorus_status,
        potassium_status,
        organic_carbon_status
    ]

    low_count = nutrient_statuses.count("Low")
    high_count = nutrient_statuses.count("High")

    if low_count >= 3:
        overall_status = "Low Fertility"
    elif high_count >= 2:
        overall_status = "Nutrient Imbalance"
    elif low_count >= 1:
        overall_status = "Moderate Fertility"
    else:
        overall_status = "Good Fertility"

    improvement_suggestions = get_soil_improvement_suggestions(
        nitrogen_status,
        phosphorus_status,
        potassium_status,
        ph_status,
        organic_carbon_status
    )

    return {
        "nitrogen_status": nitrogen_status,
        "phosphorus_status": phosphorus_status,
        "potassium_status": potassium_status,
        "organic_carbon_status": organic_carbon_status,
        "ph_status": ph_status,
        "overall_status": overall_status,
        "improvement_suggestions": improvement_suggestions,
        "disclaimer": (
            "This analysis provides indicative soil-test interpretations "
            "using general thresholds. Recommendations are educational "
            "and not fixed fertilizer prescriptions. Verify soil-test "
            "methods, units, crop needs and local agricultural guidance."
        )
    }
