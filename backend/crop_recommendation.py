
# SoilSense AI - Crop Recommendation Engine
# Initial prototype: preliminary soil-pH compatibility
# Crop profiles must be validated against local agronomic guidance.

CROP_DATABASE = {
    "Ragi (Finger Millet)": {
        "ph_min": 5.0,
        "ph_max": 7.5,
        "category": "Millet",
        "description": "A commonly cultivated millet in Karnataka."
    },
    "Rice": {
        "ph_min": 5.5,
        "ph_max": 7.0,
        "category": "Cereal",
        "description": "A cereal crop commonly grown under suitable water conditions."
    },
    "Maize": {
        "ph_min": 5.5,
        "ph_max": 7.5,
        "category": "Cereal",
        "description": "A cereal crop grown in different agricultural regions."
    },
    "Groundnut": {
        "ph_min": 5.5,
        "ph_max": 7.0,
        "category": "Oilseed",
        "description": "An important oilseed and rainfed crop."
    },
    "Red Gram (Tur)": {
        "ph_min": 5.5,
        "ph_max": 7.5,
        "category": "Pulse",
        "description": "A pulse crop commonly cultivated in Karnataka."
    },
    "Green Gram": {
        "ph_min": 6.0,
        "ph_max": 7.5,
        "category": "Pulse",
        "description": "A short-duration pulse crop."
    },
    "Soybean": {
        "ph_min": 6.0,
        "ph_max": 7.5,
        "category": "Oilseed",
        "description": "An oilseed and protein crop."
    },
    "Cotton": {
        "ph_min": 5.5,
        "ph_max": 8.0,
        "category": "Commercial Crop",
        "description": "A commercial fibre crop."
    },
    "Sunflower": {
        "ph_min": 6.0,
        "ph_max": 7.5,
        "category": "Oilseed",
        "description": "An important oilseed crop."
    },
    "Sorghum (Jowar)": {
        "ph_min": 5.5,
        "ph_max": 8.0,
        "category": "Millet",
        "description": "A cereal crop grown in several dryland regions."
    }
}


def calculate_ph_compatibility(ph, crop):
    """
    Calculate a preliminary pH compatibility score.
    This is a prototype score, not a validated crop-yield prediction.
    """

    minimum = crop["ph_min"]
    maximum = crop["ph_max"]

    if minimum <= ph <= maximum:
        return 100

    if ph < minimum:
        difference = minimum - ph
    else:
        difference = ph - maximum

    score = max(0, 100 - (difference * 20))

    return round(score, 1)


def get_crop_recommendations(data):
    """
    Automatically rank crops using preliminary pH compatibility.
    NPK and organic carbon are displayed as separate soil
    condition indicators, not used to claim crop-specific suitability.
    """

    crop_results = []

    for crop_name, crop_info in CROP_DATABASE.items():

        score = calculate_ph_compatibility(
            data.ph,
            crop_info
        )

        crop_results.append({
            "crop": crop_name,
            "category": crop_info["category"],
            "compatibility_score": score,
            "ph_range": (
                f'{crop_info["ph_min"]} - {crop_info["ph_max"]}'
            ),
            "description": crop_info["description"],
            "status": (
                "Within indicative pH range"
                if score == 100
                else "Outside indicative pH range"
            )
        })

    crop_results.sort(
        key=lambda item: item["compatibility_score"],
        reverse=True
    )

    return {
        "recommended_crops": crop_results[:5],
        "assessment_basis": "Preliminary soil pH compatibility",
        "disclaimer": (
            "These are experimental prototype results based on "
            "indicative pH ranges. They do not establish overall "
            "crop suitability. Rainfall, irrigation, soil texture, "
            "season, variety and local agronomic recommendations "
            "must also be considered."
        )
    }

def analyze_selected_crop(data, crop_name):
    """
    Analyse a crop selected by the farmer.
    Accepts crop names and common shorter names.
    """

    crop_aliases = {
        "ragi": "Ragi (Finger Millet)",
        "finger millet": "Ragi (Finger Millet)",
        "tur": "Red Gram (Tur)",
        "red gram": "Red Gram (Tur)",
        "jowar": "Sorghum (Jowar)",
        "sorghum": "Sorghum (Jowar)"
    }

    entered_name = crop_name.strip().lower()

    matched_crop = crop_aliases.get(
        entered_name,
        crop_name.strip()
    )

    # Match without considering capitalisation
    for database_crop in CROP_DATABASE:
        if database_crop.lower() == matched_crop.lower():
            matched_crop = database_crop
            break
    else:
        return {
            "error": "Crop not found in the crop database.",
            "available_crops": list(CROP_DATABASE.keys())
        }

    crop_info = CROP_DATABASE[matched_crop]

    score = calculate_ph_compatibility(
        data.ph,
        crop_info
    )

    if score == 100:
        status = "Within indicative pH range"
        explanation = (
            "The entered soil pH falls within this crop's "
            "indicative pH range."
        )
    else:
        status = "Outside indicative pH range"
        explanation = (
            "The entered soil pH falls outside this crop's "
            "indicative pH range. Seek local agronomic guidance."
        )

    return {
        "selected_crop": matched_crop,
        "category": crop_info["category"],
        "compatibility_score": score,
        "status": status,
        "ph_range": (
            f'{crop_info["ph_min"]} - {crop_info["ph_max"]}'
        ),
        "explanation": explanation,
        "description": crop_info["description"],
        "disclaimer": (
            "This is a preliminary pH-based assessment, not a "
            "complete crop suitability prediction."
        )
    }


