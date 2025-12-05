const form = document.getElementById("risk-form");
const riskOutput = document.getElementById("risk-output");
const API_URL = "http://localhost:8000/predict";

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    technical_condition: toNumber(
      document.getElementById("technical_condition").value
    ),
    passport_age_years: toNumber(
      document.getElementById("passport_age_years").value
    ),
    resource_type: toNumber(document.getElementById("resource_type").value),
    water_type: toNumber(document.getElementById("water_type").value),
    fauna: toNumber(document.getElementById("fauna").value),
    region_id: toNumber(document.getElementById("region_id").value),
  };

  try {
    riskOutput.textContent = "AI Risk Prediction: ...";

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API error ${response.status}`);
    }

    const data = await response.json();
    const riskPercent = (data.risk * 100).toFixed(1);
    riskOutput.textContent = `AI Risk Prediction: ${riskPercent}%`;
  } catch (error) {
    riskOutput.textContent = `Ошибка: ${error.message}`;
    console.error(error);
  }
});

