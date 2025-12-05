const uploadBtn = document.getElementById("uploadBtn");
const csvInput = document.getElementById("csvInput");
const message = document.getElementById("message");
const sortSelect = document.getElementById("sortSelect");
const table = document.getElementById("resultsTable");
const tbody = table.querySelector("tbody");
const metricsPanel = document.getElementById("metricsPanel");
const metricsFields = {
  total: document.getElementById("m_total"),
  avgCondition: document.getElementById("m_avg_condition"),
  critical: document.getElementById("m_critical"),
  noPassport: document.getElementById("m_no_passport"),
  avgAge: document.getElementById("m_avg_age"),
};
const chartElements = {
  condition: document.getElementById("conditionChart"),
  risk: document.getElementById("riskChart"),
  passportAge: document.getElementById("passportAgeChart"),
  type: document.getElementById("typeChart"),
};
const API_BASE_URL = "http://localhost:8000";

function setMessage(text, isError = false) {
  message.textContent = text;
  message.style.color = isError ? "#dc2626" : "#1f2933";
}

function formatRisk(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }
  return `${(value * 100).toFixed(1)}%`;
}

function renderMetrics(metrics) {
  if (!metrics) {
    metricsPanel.hidden = true;
    Object.values(metricsFields).forEach((el) => {
      el.textContent = "—";
    });
    return;
  }

  metricsPanel.hidden = false;
  metricsFields.total.textContent = metrics.total_objects ?? 0;
  metricsFields.avgCondition.textContent = (
    metrics.avg_condition ?? 0
  ).toFixed(2);
  metricsFields.critical.textContent = metrics.critical_objects ?? 0;
  metricsFields.noPassport.textContent = metrics.without_passport ?? 0;
  metricsFields.avgAge.textContent = (metrics.avg_passport_age ?? 0).toFixed(1);
}

function renderTable(data) {
  if (!Array.isArray(data) || data.length === 0) {
    table.hidden = true;
    return;
  }

  tbody.innerHTML = "";
  data.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name ?? "—"}</td>
      <td>${item.technical_condition}</td>
      <td>${item.passport_age_years}</td>
      <td>${item.priority_score}</td>
      <td>${formatRisk(item.timeline?.["3_months"])}</td>
      <td>${formatRisk(item.timeline?.["6_months"])}</td>
      <td>${formatRisk(item.timeline?.["12_months"])}</td>
      <td>${formatRisk(item.timeline?.["24_months"])}</td>
    `;
    tbody.appendChild(row);
  });

  table.hidden = false;
}

async function loadCharts(processedData) {
  if (!Array.isArray(processedData) || processedData.length === 0) {
    Object.values(chartElements).forEach((el) => {
      el.removeAttribute("src");
      el.style.visibility = "hidden";
    });
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/visualize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(processedData),
    });

    if (!response.ok) {
      throw new Error("Не удалось получить диаграммы");
    }

    const charts = await response.json();
    const setChart = (element, value) => {
      if (value) {
        element.src = `data:image/png;base64,${value}`;
        element.style.visibility = "visible";
      } else {
        element.removeAttribute("src");
        element.style.visibility = "hidden";
      }
    };

    setChart(chartElements.condition, charts.condition_chart);
    setChart(chartElements.risk, charts.risk_chart);
    setChart(chartElements.passportAge, charts.passport_age_chart);
    setChart(chartElements.type, charts.type_chart);
  } catch (error) {
    console.error(error);
  }
}

uploadBtn.addEventListener("click", async () => {
  const file = csvInput.files[0];

  if (!file) {
    setMessage("Выберите CSV файл.", true);
    return;
  }

  const sortBy = sortSelect.value;
  const formData = new FormData();
  formData.append("file", file);
  uploadBtn.disabled = true;
  setMessage("Анализируем...");

  try {
    const response = await fetch(
      `${API_BASE_URL}/analyze_csv?sort_by=${encodeURIComponent(sortBy)}`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Ошибка анализа");
    }

    const payload = await response.json();
    const { metrics, results } = payload;
    renderMetrics(metrics);
    renderTable(results);
    loadCharts(results);
    if (Array.isArray(results) && results.length > 0) {
      setMessage(`Получено ${results.length} результатов.`);
    } else {
      setMessage("Нет данных для отображения.");
    }
  } catch (error) {
    setMessage(error.message || "Не удалось выполнить запрос", true);
    table.hidden = true;
    renderMetrics(null);
  } finally {
    uploadBtn.disabled = false;
  }
});

