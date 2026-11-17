
import json


# Load the trained Decision Tree model
with open("soil_model.json", "r") as file:
    saved_model = json.load(file)
  

tree = saved_model["tree"]


def predict_soil(features):

    def predict(node):

        if "leaf" in node:
            return node["leaf"]

        feature_index = node["feature"]
        threshold = node["threshold"]

        if features[feature_index] <= threshold:
            return predict(node["left"])

        return predict(node["right"])

    result = predict(tree)

    return {
        "predicted_fertility": result,
        "model": "Experimental Decision Tree",
        "disclaimer": (
            "Prediction generated using a model trained on synthetic "
            "soil data. It is not validated for real-world agricultural use."
        )
    }
