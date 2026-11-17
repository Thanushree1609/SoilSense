
import jsPDF from "jspdf";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import "./App.css";

function SoilPHGauge({ ph }) {
  const value = Math.max(0, Math.min(14, Number(ph)));
  const position = (value / 14) * 100;

  let label = "Near Neutral";
  if (value < 6.5) label = "Acidic";
  else if (value > 7.5) label = "Alkaline";

  return (
    <div className="ph-gauge-card">
      <h3>Soil pH Level</h3>
      <p className="ph-subtitle">
        Acidity and alkalinity assessment
      </p>

      <div className="ph-value">
        {value.toFixed(1)}
      </div>

      <div className="ph-status">
        {label}
      </div>

      <div className="ph-scale">
        <div
          className="ph-marker"
          style={{ left: `${position}%` }}
        />
      </div>

      <div className="ph-scale-labels">
        <span>0 · Acidic</span>
        <span>7 · Neutral</span>
        <span>14 · Alkaline</span>
      </div>
    </div>
  );
}

function App() {
  const [formData, setFormData] = useState({
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    ph: "",
    organic_carbon: ""
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("Ragi (Finger Millet)");
  const [selectedCropResult, setSelectedCropResult] = useState(null);
  const [cropLoading, setCropLoading] = useState(false);
  const [cropError, setCropError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const downloadPDF = () => {
    if (!results) return;

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(33, 132, 86);
    doc.text("SoilSense AI", 20, 20);

    doc.setFontSize(12);
    doc.setTextColor(70, 70, 70);
    doc.text("Soil Analysis Report", 20, 30);

    doc.line(20, 35, 190, 35);

    doc.setFontSize(12);
    doc.text("SOIL TEST INPUT VALUES", 20, 47);

    doc.setFontSize(10);
    doc.text(`Nitrogen: ${formData.nitrogen} kg/ha`, 20, 58);
    doc.text(`Phosphorus: ${formData.phosphorus} kg/ha`, 20, 66);
    doc.text(`Potassium: ${formData.potassium} kg/ha`, 20, 74);
    doc.text(`Soil pH: ${formData.ph}`, 20, 82);
    doc.text(`Organic Carbon: ${formData.organic_carbon}%`, 20, 90);

    doc.setFontSize(12);
    doc.text("RULE-BASED SOIL ASSESSMENT", 20, 105);

    doc.setFontSize(10);
    doc.text(
      `Overall Assessment: ${results.analysis.overall_assessment}`,
      20,
      115
    );

    let y = 125;

    Object.entries(results.analysis.nutrient_status || {}).forEach(
      ([name, status]) => {
        doc.text(`${name}: ${status}`, 20, y);
        y += 8;
      }
    );

    doc.text(`pH Status: ${results.analysis.ph_status}`, 20, y);
    y += 15;

    if (selectedCropResult) {
      doc.setFontSize(12);
      doc.text("SELECTED CROP ASSESSMENT", 20, y);
      y += 9;
      doc.setFontSize(10);
      doc.text(`Crop: ${selectedCropResult.selected_crop}`, 20, y);
      y += 7;
      doc.text(`pH Compatibility: ${selectedCropResult.compatibility_score}%`, 20, y);
      y += 7;
      doc.text(`Status: ${selectedCropResult.status}`, 20, y);
      y += 12;
    }

    doc.setFontSize(12);
    doc.text("MACHINE LEARNING PREDICTION", 20, y);

    y += 10;
    doc.setFontSize(10);
    doc.text(
      `Predicted Class: ${results.prediction.predicted_fertility}`,
      20,
      y
    );

    y += 15;
    doc.setFontSize(12);
    doc.text("SOIL IMPROVEMENT SUGGESTIONS", 20, y);

    y += 9;
    doc.setFontSize(10);

    (results.analysis.improvement_suggestions || []).forEach((item) => {

  if (y + 15 > 270) {
    doc.addPage();
    y = 20;
  }

  doc.setFont(undefined, "bold");
  doc.text(`${item.parameter} - ${item.status}`, 20, y);
  y += 8;

  doc.setFont(undefined, "normal");

  (item.suggestion || []).forEach((suggestion) => {
    const lines = doc.splitTextToSize(`- ${suggestion}`, 165);

    if (y + lines.length * 6 > 270) {
      doc.addPage();
      y = 20;
    }

    doc.text(lines, 20, y);
    y += lines.length * 6 + 3;
  });

  y += 5;
});

    if (y + 35 > 280) {
      doc.addPage();
      y = 20;
    }

    y += 8;
    doc.setFontSize(9);
    doc.setTextColor(130, 90, 40);

    doc.text(
      "Disclaimer: This is an academic prototype. The ML model uses synthetic data and has not been validated for real-world agricultural use. Consult a qualified agricultural expert before making soil-management decisions.",
      20,
      y,
      { maxWidth: 165 }
    );

    doc.save("SoilSense_AI_Soil_Report.pdf");
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResults(null);

    const payload = {
      nitrogen: Number(formData.nitrogen),
      phosphorus: Number(formData.phosphorus),
      potassium: Number(formData.potassium),
      ph: Number(formData.ph),
      organic_carbon: Number(formData.organic_carbon)
    };

    try {
      const [
        analysisResponse,
        predictionResponse,
        cropRecommendationResponse
      ] = await Promise.all([
        fetch("https://soilsense-backend-j4du.onrender.com/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }),
        fetch("https://soilsense-backend-j4du.onrender.com/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }),
        fetch("https://soilsense-backend-j4du.onrender.com/crop-recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
      ]);

      if (
        !analysisResponse.ok ||
        !predictionResponse.ok ||
        !cropRecommendationResponse.ok
      ) {
        throw new Error("Backend analysis failed. Please check your inputs and backend.");
      }

      const analysis = await analysisResponse.json();
      const prediction = await predictionResponse.json();
      const cropRecommendations = await cropRecommendationResponse.json();

      setResults({ analysis, prediction, cropRecommendations });
      setSelectedCropResult(null);
      setCropError("");

    } catch (err) {
      setError(
        "Unable to connect to the backend. Make sure the FastAPI server is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectedCropAnalysis = async () => {
    if (!results) {
      setCropError("Please analyse your soil first.");
      return;
    }

    setCropLoading(true);
    setCropError("");
    setSelectedCropResult(null);

    const payload = {
      nitrogen: Number(formData.nitrogen),
      phosphorus: Number(formData.phosphorus),
      potassium: Number(formData.potassium),
      ph: Number(formData.ph),
      organic_carbon: Number(formData.organic_carbon),
      crop_name: selectedCrop
    };

    try {
      const response = await fetch("https://soilsense-backend-j4du.onrender.com/analyze-crop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Selected crop analysis failed.");
      }

      setSelectedCropResult(data);
    } catch (err) {
      setCropError(err.message || "Unable to analyse the selected crop.");
    } finally {
      setCropLoading(false);
    }
  };

  const nutrientData = results
    ? [
        {
          name: "Nitrogen",
          value: Number(formData.nitrogen),
          unit: "kg/ha"
        },
        {
          name: "Phosphorus",
          value: Number(formData.phosphorus),
          unit: "kg/ha"
        },
        {
          name: "Potassium",
          value: Number(formData.potassium),
          unit: "kg/ha"
        },
        {
          name: "Organic Carbon",
          value: Number(formData.organic_carbon),
          unit: "%"
        }
      ]
    : [];

  const automaticCropList = results
    ? (
        results.cropRecommendations.recommended_crops ||
        results.cropRecommendations.recommendations ||
        results.cropRecommendations.crops ||
        results.cropRecommendations.top_crops ||
        []
      )
    : [];

  const statusColor = (status) => {
    const value = String(status || "").toLowerCase();

    if (value.includes("low") || value.includes("acidic")) {
      return "status-low";
    }

    if (value.includes("high") || value.includes("alkaline")) {
      return "status-high";
    }

    return "status-medium";
  };

  return (
    <div className="app-container">

      <header className="top-header">
        <div className="brand">
          <div className="brand-icon">🌱</div>
          <div>
            <h1>SoilSense AI</h1>
            <p>Smart Soil Intelligence Platform</p>
          </div>
        </div>

        <div className="header-tag">AI Powered Soil Analysis</div>
      </header>

      <main className="dashboard">

        <section className="welcome-section">
          <div>
            <p className="eyebrow">SMART AGRICULTURE SOLUTION</p>
            <h2>Understand Your Soil Better</h2>
            <p>
              Analyse laboratory soil-test values and explore
              data-driven soil fertility insights.
            </p>
          </div>

          <div className="welcome-icon">🌾</div>
        </section>

        <section className="input-section">
          <div className="section-heading">
            <div>
              <h2>Soil Test Input</h2>
              <p>Enter the values from your laboratory soil report.</p>
            </div>
            <span className="section-number">01</span>
          </div>

          <form onSubmit={handleAnalyze}>

            <div className="input-grid">

              <div className="input-group">
                <label>Nitrogen (N)</label>
                <input
                  type="number"
                  name="nitrogen"
                  placeholder="Enter N value"
                  value={formData.nitrogen}
                  onChange={handleChange}
                  min="0"
                  max="10000"
                  step="any"
                  required
                />
                <small>Unit: kg/ha</small>
              </div>

              <div className="input-group">
                <label>Phosphorus (P)</label>
                <input
                  type="number"
                  name="phosphorus"
                  placeholder="Enter P value"
                  value={formData.phosphorus}
                  onChange={handleChange}
                  min="0"
                  max="10000"
                  step="any"
                  required
                />
                <small>Unit: kg/ha</small>
              </div>

              <div className="input-group">
                <label>Potassium (K)</label>
                <input
                  type="number"
                  name="potassium"
                  placeholder="Enter K value"
                  value={formData.potassium}
                  onChange={handleChange}
                  min="0"
                  max="10000"
                  step="any"
                  required
                />
                <small>Unit: kg/ha</small>
              </div>

              <div className="input-group">
                <label>Soil pH</label>
                <input
                  type="number"
                  name="ph"
                  placeholder="Enter pH value"
                  value={formData.ph}
                  onChange={handleChange}
                  min="0"
                  max="14"
                  step="any"
                  required
                />
                <small>Range: 0–14</small>
              </div>

              <div className="input-group">
                <label>Organic Carbon</label>
                <input
                  type="number"
                  name="organic_carbon"
                  placeholder="Enter OC value"
                  value={formData.organic_carbon}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="any"
                  required
                />
                <small>Unit: %</small>
              </div>

            </div>

            <button
              type="submit"
              className="analyze-button"
              disabled={loading}
            >
              {loading ? "Analysing Soil..." : "Analyse My Soil"}
            </button>

          </form>

          {error && <p className="error-message">{error}</p>}
        </section>

        {results && (
          <>

            <section className="results-section">

              <div className="section-heading">
                <div>
                  <h2>Soil Analysis Results</h2>
                  <p>Assessment based on your entered soil-test values.</p>
                </div>
                <span className="section-number">02</span>
              </div>

              <div className="assessment-card">
                <div>
                  <p className="card-label">RULE-BASED ASSESSMENT</p>
                  <h2>
                    {results.analysis.overall_assessment}
                  </h2>
                  <p>
                    Soil condition summary generated by the
                    rule-based analysis engine.
                  </p>
                </div>
                <div className="assessment-icon">🌿</div>
              </div>

              <div className="nutrient-grid">

                {Object.entries(
                  results.analysis.nutrient_status || {}
                ).map(([name, status]) => (
                  <div className="nutrient-card" key={name}>
                    <p>{name.replaceAll("_", " ")}</p>
                    <h3 className={statusColor(status)}>
                      {status}
                    </h3>
                    <span>Classification</span>
                  </div>
                ))}

                <div className="nutrient-card">
                  <p>Soil pH</p>
                  <h3 className={statusColor(results.analysis.ph_status)}>
                    {results.analysis.ph_status}
                  </h3>
                  <span>pH classification</span>
                </div>

              </div>

            </section>
<section className="ph-section">
  <div className="section-heading">
    <div>
      <h2>Soil pH Analysis</h2>
      <p>Visual representation of soil acidity and alkalinity.</p>
    </div>
    <span className="section-number">03</span>
  </div>

  <SoilPHGauge ph={formData.ph} />
</section>
            <section className="chart-section">

              <div className="section-heading">
                <div>
                  <h2>Nutrient Value Comparison</h2>
                  <p>
                    Actual values entered in the soil-test form.
                    Units differ between organic carbon and NPK.
                  </p>
                </div>
                <span className="section-number">03</span>
              </div>

              <div className="chart-card">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={nutrientData}
                    margin={{ top: 20, right: 20, left: 5, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name, props) => [
                        `${value} ${props.payload.unit}`,
                        "Entered value"
                      ]}
                    />
                    <Bar
                      dataKey="value"
                      radius={[7, 7, 0, 0]}
                      barSize={48}
                    >
                      {nutrientData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill="#31966b"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="chart-note">
                  Note: This chart displays raw input values.
                  It does not imply that NPK and organic carbon
                  are measured on the same scale.
                </p>
              </div>

            </section>

            <section className="ml-section">

              <div className="section-heading">
                <div>
                  <h2>Machine Learning Prediction</h2>
                  <p>Experimental Decision Tree model output.</p>
                </div>
                <span className="section-number">04</span>
              </div>

              <div className="ml-card">
                <div className="ml-icon">AI</div>
                <div>
                  <p className="card-label">PREDICTED FERTILITY CLASS</p>
                  <h2>
                    {results.prediction.predicted_fertility}
                  </h2>
                  <p>
                    Model: {results.prediction.model}
                  </p>
                </div>
              </div>

            </section>

           
<section className="recommendation-section">

  <div className="section-heading">
    <div>
      <h2>Soil Improvement Guide</h2>
      <p>
        Understand your soil condition and learn how to improve it.
      </p>
    </div>
    <span className="section-number">05</span>
  </div>

  <div className="improvement-grid">

    {(results.analysis.improvement_suggestions || []).map(
      (item, index) => (

        <div className="improvement-card" key={index}>

          <div className="improvement-card-header">
            <h3>{item.parameter}</h3>

            <span className={statusColor(item.status)}>
              {item.status}
            </span>
          </div>

          <h4>Suggested Improvements</h4>

          <ul>
            {(item.suggestion || []).map((suggestion, i) => (
              <li key={i}>{suggestion}</li>
            ))}
          </ul>

        </div>

      )
    )}

  </div>

  <p className="improvement-note">
    These are general educational suggestions. Actual soil amendments
    and fertilizer applications should be based on laboratory
    recommendations, crop requirements and local agricultural guidance.
  </p>

</section>

            <section className="crop-section">
              <div className="section-heading">
                <div>
                  <h2>Automatic Crop Recommendations</h2>
                  <p>
                    Crops ranked using preliminary soil pH compatibility.
                    Consider local climate, irrigation, soil texture and season too.
                  </p>
                </div>
                <span className="section-number">06</span>
              </div>

              {automaticCropList.length > 0 ? (
                <div className="crop-grid">
                  {automaticCropList.map((crop, index) => (
                    <div className="crop-card" key={crop.crop || crop.crop_name || index}>
                      <div className="crop-card-top">
                        <span className="crop-rank">#{index + 1}</span>
                        <span className="crop-category">
                          {crop.category || "Crop"}
                        </span>
                      </div>
                      <h3>{crop.crop || crop.crop_name || crop.name || "Recommended crop"}</h3>
                      <p className="crop-score">
                        {crop.score ?? crop.compatibility_score ?? crop.ph_compatibility ?? "—"}
                        {(crop.score !== undefined ||
                          crop.compatibility_score !== undefined ||
                          crop.ph_compatibility !== undefined) ? "% pH compatibility" : "Compatibility score unavailable"}
                      </p>
                      <p className="crop-range">
                        Indicative pH range: {crop.ph_range || "Not specified"}
                      </p>
                      <p className="crop-description">
                        {crop.description || crop.explanation || ""}
                      </p>
                      {crop.status && <span className="crop-status">{crop.status}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="crop-empty">
                  No crop recommendations were returned. Check the response from
                  the /crop-recommendations endpoint.
                </p>
              )}

              <p className="crop-disclaimer">
                {results.cropRecommendations.disclaimer ||
                  "These are preliminary pH-based suggestions, not complete crop suitability predictions. Confirm with local agricultural experts."}
              </p>
            </section>

            <section className="crop-section">
              <div className="section-heading">
                <div>
                  <h2>Analyse Your Selected Crop</h2>
                  <p>
                    Choose a crop to check its indicative pH compatibility
                    with the soil values entered above.
                  </p>
                </div>
                <span className="section-number">07</span>
              </div>

              <div className="selected-crop-controls">
                <div className="input-group">
                  <label htmlFor="selected-crop">Select a crop</label>
                  <select
                    id="selected-crop"
                    value={selectedCrop}
                    onChange={(e) => {
                      setSelectedCrop(e.target.value);
                      setSelectedCropResult(null);
                      setCropError("");
                    }}
                  >
                    <option value="Ragi (Finger Millet)">Ragi (Finger Millet)</option>
                    <option value="Rice">Rice</option>
                    <option value="Maize">Maize</option>
                    <option value="Groundnut">Groundnut</option>
                    <option value="Red Gram (Tur)">Red Gram (Tur)</option>
                    <option value="Green Gram">Green Gram</option>
                    <option value="Soybean">Soybean</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Sunflower">Sunflower</option>
                    <option value="Sorghum (Jowar)">Sorghum (Jowar)</option>
                  </select>
                </div>

                <button
                  type="button"
                  className="crop-analyze-button"
                  onClick={handleSelectedCropAnalysis}
                  disabled={cropLoading}
                >
                  {cropLoading ? "Analysing Crop..." : "Analyse Selected Crop"}
                </button>
              </div>

              {cropError && <p className="error-message">{cropError}</p>}

              {selectedCropResult && (
                <div className="selected-crop-result">
                  <p className="card-label">SELECTED CROP ASSESSMENT</p>
                  <h3>{selectedCropResult.selected_crop}</h3>
                  <p><strong>Category:</strong> {selectedCropResult.category}</p>
                  <p>
                    <strong>Preliminary pH compatibility:</strong>{" "}
                    {selectedCropResult.compatibility_score}%
                  </p>
                  <p><strong>Status:</strong> {selectedCropResult.status}</p>
                  <p><strong>Indicative pH range:</strong> {selectedCropResult.ph_range}</p>
                  <p>{selectedCropResult.explanation}</p>
                  {selectedCropResult.description && (
                    <p>{selectedCropResult.description}</p>
                  )}
                  <p className="crop-disclaimer">
                    {selectedCropResult.disclaimer}
                  </p>
                </div>
              )}
            </section>

<div className="pdf-download-section">
  <button
    className="pdf-button"
    onClick={downloadPDF}
  >
    Download Soil Analysis Report (PDF)
  </button>
</div>
            <div className="disclaimer">
              <strong>Important Disclaimer</strong>
              <p>
                {results.analysis.disclaimer}
              </p>
              <p>
                {results.prediction.disclaimer}
              </p>
              <p>
                The machine learning model is trained on synthetic
                data and is experimental. Its predictions are not
                validated for real-world agricultural use. Consult
                a qualified agricultural expert before making
                fertilizer or soil-management decisions.
              </p>
            </div>

          </>
        )}

        <footer className="footer">
          <h3>SoilSense AI</h3>
          <p>Intelligent Soil Analysis for Sustainable Agriculture</p>
          <span>Academic Mini Project | AIML</span>
        </footer>

      </main>
    </div>
  );
}

export default App;
