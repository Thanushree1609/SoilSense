
import csv
import random
import json

random.seed(42)

# Load the synthetic dataset
data = []

with open("synthetic_soil_dataset.csv", "r") as file:
    reader = csv.DictReader(file)

    for row in reader:
        data.append({
            "features": [
                float(row["Nitrogen"]),
                float(row["Phosphorus"]),
                float(row["Potassium"]),
                float(row["pH"]),
                float(row["Organic_Carbon"])
            ],
            "label": row["Fertility_Class"]
        })

# Shuffle dataset
random.shuffle(data)

# Split into training and testing data
split_index = int(len(data) * 0.8)

train_data = data[:split_index]
test_data = data[split_index:]

feature_names = [
    "Nitrogen",
    "Phosphorus",
    "Potassium",
    "pH",
    "Organic_Carbon"
]


def gini(groups):
    total = sum(len(group) for group in groups)

    score = 0

    for group in groups:
        if len(group) == 0:
            continue

        counts = {}

        for item in group:
            label = item["label"]
            counts[label] = counts.get(label, 0) + 1

        impurity = 1

        for count in counts.values():
            probability = count / len(group)
            impurity -= probability ** 2

        score += (len(group) / total) * impurity

    return score


def find_best_split(dataset):

    best_score = float("inf")
    best_feature = None
    best_threshold = None

    for feature_index in range(5):

        values = sorted(set(
            item["features"][feature_index]
            for item in dataset
        ))

        if len(values) < 2:
            continue

        # Limit candidate thresholds for faster training
        step = max(1, len(values) // 20)

        thresholds = [
            (values[i] + values[i + 1]) / 2
            for i in range(0, len(values) - 1, step)
        ]

        for threshold in thresholds:

            left = [
                item for item in dataset
                if item["features"][feature_index] <= threshold
            ]

            right = [
                item for item in dataset
                if item["features"][feature_index] > threshold
            ]

            if not left or not right:
                continue

            score = gini([left, right])

            if score < best_score:
                best_score = score
                best_feature = feature_index
                best_threshold = threshold

    return best_feature, best_threshold


def build_tree(dataset, depth=0):

    labels = [item["label"] for item in dataset]

    counts = {}

    for label in labels:
        counts[label] = counts.get(label, 0) + 1

    majority_label = max(counts, key=counts.get)

    # Stop conditions
    if (
        len(counts) == 1
        or depth >= 5
        or len(dataset) < 20
    ):
        return {"leaf": majority_label}

    feature, threshold = find_best_split(dataset)

    if feature is None:
        return {"leaf": majority_label}

    left = [
        item for item in dataset
        if item["features"][feature] <= threshold
    ]

    right = [
        item for item in dataset
        if item["features"][feature] > threshold
    ]

    if not left or not right:
        return {"leaf": majority_label}

    return {
        "feature": feature,
        "threshold": threshold,
        "left": build_tree(left, depth + 1),
        "right": build_tree(right, depth + 1)
    }


def predict(tree, features):

    if "leaf" in tree:
        return tree["leaf"]

    feature = tree["feature"]
    threshold = tree["threshold"]

    if features[feature] <= threshold:
        return predict(tree["left"], features)

    return predict(tree["right"], features)


# Train the model
print("Training Decision Tree model...")

model = build_tree(train_data)

# Test the model
correct = 0

for item in test_data:

    prediction = predict(model, item["features"])

    if prediction == item["label"]:
        correct += 1

accuracy = (correct / len(test_data)) * 100

# Save trained model
with open("soil_model.json", "w") as file:
    json.dump({
        "feature_names": feature_names,
        "tree": model
    }, file, indent=4)

print("\nModel training completed!")
print("Training records:", len(train_data))
print("Testing records:", len(test_data))
print("Model accuracy:", round(accuracy, 2), "%")
print("Saved model: soil_model.json")
