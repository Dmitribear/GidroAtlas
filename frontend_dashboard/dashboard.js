const API_BASE = "http://localhost:8000"

const state = {
  results: [],
  graphs: {},
}

document.addEventListener("DOMContentLoaded", () => {
  const analyzeBtn = document.getElementById("analyzeBtn")
  const tabs = document.querySelectorAll(".tab-btn")

  analyzeBtn.addEventListener("click", handleAnalyze)

  tabs.forEach((tab) =>
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"))
      tab.classList.add("active")
      const target = tab.dataset.tab
      document.querySelectorAll(".tab-content").forEach((panel) => {
        panel.classList.toggle("hidden", panel.id !== `${target}Tab`)
      })
    }),
  )
})

async function handleAnalyze() {
  const status = document.getElementById("statusText")
  const csvInput = document.getElementById("csvInput")
  const jsonInput = document.getElementById("jsonInput")

  status.textContent = "Обрабатываю..."

  try {
    const payload = await preparePayload(csvInput.files[0], jsonInput.value.trim())
    if (!payload.length) {
      status.textContent = "Добавьте хотя бы один объект."
      return
    }

    const aiResponse = await fetch(`${API_BASE}/ai/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!aiResponse.ok) {
      throw new Error("Ошибка анализа AI")
    }
    const aiData = await aiResponse.json()
    state.results = aiData.results || []

    const vizResponse = await fetch(`${API_BASE}/visualize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state.results),
    })
    state.graphs = vizResponse.ok ? await vizResponse.json() : {}

    renderDashboard()
    status.textContent = `Готово: ${state.results.length} объектов`
  } catch (error) {
    console.error(error)
    status.textContent = error.message || "Не удалось выполнить анализ"
  }
}

async function preparePayload(file, jsonString) {
  if (jsonString) {
    return JSON.parse(jsonString)
  }
  if (!file) return []
  const text = await file.text()
  return parseCsv(text)
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  if (lines.length < 2) return []
  const headers = splitCsvLine(lines[0])
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line)
    const entry = {}
    headers.forEach((header, idx) => {
      entry[header] = values[idx] ?? ""
    })
    if (entry.technical_condition) entry.technical_condition = Number(entry.technical_condition)
    if (entry.passport_age_years) entry.passport_age_years = Number(entry.passport_age_years)
    if (entry.latitude) entry.latitude = Number(entry.latitude)
    if (entry.longitude) entry.longitude = Number(entry.longitude)
    return entry
  })
}

function splitCsvLine(line) {
  const result = []
  let current = ""
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }
    if (char === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
      continue
    }
    current += char
  }
  if (current.length || line.endsWith(",")) {
    result.push(current.trim())
  }
  return result
}

function renderDashboard() {
  renderMetrics()
  renderGraphs()
  renderTable()
}

function renderMetrics() {
  const panel = document.getElementById("metricsPanel")
  panel.innerHTML = ""
  if (!state.results.length) return

  const total = state.results.length
  const avgCondition =
    state.results.reduce((sum, obj) => sum + Number(obj.technical_condition || 0), 0) / total
  const critical = state.results.filter((obj) => Number(obj.technical_condition) >= 4).length
  const avgRisk12 =
    state.results.reduce((sum, obj) => sum + Number(obj.risk?.["12m"] || 0), 0) / total
  const highPriority = state.results.filter((obj) => obj.priority_level === "Высокий").length

  const metrics = [
    { label: "Всего объектов", value: total },
    { label: "Среднее состояние", value: avgCondition.toFixed(1) },
    { label: "Критичных", value: critical },
    { label: "Высокий приоритет", value: highPriority },
    { label: "Средний риск (12м)", value: `${(avgRisk12 * 100).toFixed(1)}%` },
  ]

  metrics.forEach((metric) => {
    const card = document.createElement("div")
    card.className = "bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-1"
    card.innerHTML = `<p class="text-xs uppercase tracking-wide text-slate-400">${metric.label}</p>
                      <p class="text-2xl font-semibold text-slate-900">${metric.value}</p>`
    panel.appendChild(card)
  })
}

function renderGraphs() {
  const map = {
    conditionChart: "condition_distribution",
    ageChart: "age_distribution",
    riskChart: "risk_distribution",
    typeChart: "type_distribution",
    boxChart: "boxplot",
    heatmapChart: "heatmap",
  }
  Object.entries(map).forEach(([elementId, key]) => {
    const img = document.getElementById(elementId)
    if (!img) return
    const data = state.graphs[key]
    img.src = data ? `data:image/png;base64,${data}` : ""
    img.alt = key
  })
}

function renderTable() {
  const tbody = document.querySelector("#resultsTable tbody")
  tbody.innerHTML = ""
  state.results.forEach((item) => {
    const row = document.createElement("tr")
    row.innerHTML = `
      <td>${item.name ?? "—"}</td>
      <td>${item.region ?? "—"}</td>
      <td>${item.resource_type ?? "—"}</td>
      <td>${item.technical_condition ?? "—"}</td>
      <td>${item.priority_level ?? "—"}</td>
      <td>${((item.risk?.["12m"] ?? 0) * 100).toFixed(1)}%</td>
      <td class="max-w-xs">
        <p class="text-slate-600 text-xs">${item.recommendation ?? ""}</p>
      </td>
    `
    tbody.appendChild(row)
  })
}

