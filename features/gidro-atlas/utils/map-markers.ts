export function renderMarkers(map, objects = []) {
  if (typeof window === "undefined" || typeof L === "undefined" || !map) {
    return
  }

  if (window._markers && Array.isArray(window._markers)) {
    window._markers.forEach((marker) => map.removeLayer(marker))
  }
  window._markers = []

  const colors = {
    1: "#00cc44",
    2: "#66ff66",
    3: "#ffcc00",
    4: "#ff6600",
    5: "#ff0000",
  }

  const markers = []

  objects.forEach((obj) => {
    const lat = Number(obj.latitude ?? obj.lat ?? obj.coordinates?.lat)
    const lng = Number(obj.longitude ?? obj.lng ?? obj.coordinates?.lng)
    if (Number.isNaN(lat) || Number.isNaN(lng)) return

    const color = colors[obj.technical_condition] || "#999999"

    const icon = L.divIcon({
      className: "",
      html: `
        <div style="
          width: 20px;
          height: 20px;
          background: ${color};
          border-radius: 50%;
          border: 2px solid #fff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.35);
        "></div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })

    const marker = L.marker([lat, lng], { icon }).addTo(map)
    const region = obj.region ?? "—"
    const type = obj.resource_type ?? obj.resourceType ?? "—"
    const pdfLink = obj.pdf_url
      ? `<a href="${obj.pdf_url}" target="_blank" rel="noopener">PDF паспорт</a>`
      : ""

    marker.bindPopup(
      `
        <div class="csv-marker-popup">
          <strong>${obj.name ?? "Объект"}</strong><br/>
          Регион: ${region}<br/>
          Тип: ${type}<br/>
          ${pdfLink}
        </div>
      `,
    )

    window._markers.push(marker)
    markers.push(marker)
  })

  if (markers.length) {
    const bounds = L.latLngBounds(markers.map((m) => m.getLatLng()))
    map.fitBounds(bounds, { padding: [40, 40] })
  }
}

