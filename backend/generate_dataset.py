

import csv
import random

random.seed(42)

TOTAL_RECORDS = 2000

def classify(value, low, high):
    if value < low:
        return "Low"
    elif value <= high:
        return "Medium"
    else:
        return "High"


with open("synthetic_soil_dataset.csv", "w", newline="") as file:

    writer = csv.writer(file)

    writer.writerow([
        "Nitrogen",
        "Phosphorus",
        "Potassium",
        "pH",
        "Organic_Carbon",
        "Nitrogen_Status",
        "Phosphorus_Status",
        "Potassium_Status",
        "Organic_Carbon_Status",
        "Fertility_Class"
    ])

    for i in range(TOTAL_RECORDS):

        nitrogen = round(random.uniform(50, 700), 2)
        phosphorus = round(random.uniform(2, 50), 2)
        potassium = round(random.uniform(40, 450), 2)
        ph = round(random.uniform(4, 9), 2)
        organic_carbon = round(random.uniform(0.1, 1.5), 2)

        n_status = classify(nitrogen, 280, 560)
        p_status = classify(phosphorus, 10, 24.6)
        k_status = classify(potassium, 108, 280)
        oc_status = classify(organic_carbon, 0.5, 0.75)

        low_count = [n_status, p_status, k_status].count("Low")
        high_count = [n_status, p_status, k_status].count("High")

        if low_count >= 2:
            fertility = "Low"
        elif high_count >= 2:
            fertility = "High"
        else:
            fertility = "Moderate"

        writer.writerow([
            nitrogen,
            phosphorus,
            potassium,
            ph,
            organic_carbon,
            n_status,
            p_status,
            k_status,
            oc_status,
            fertility
        ])

print("Synthetic soil dataset generated successfully!")
print("Total records:", TOTAL_RECORDS)
print("File created: synthetic_soil_dataset.csv")
