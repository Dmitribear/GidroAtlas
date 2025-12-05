export function renderMarkers(map: any, objects: any[] = []) {
  if (typeof window === 'undefined' || typeof (window as any).L === 'undefined' || !map) {
    return
  }

  if ((window as any)._markers && Array.isArray((window as any)._markers)) {
    ;(window as any)._markers.forEach((marker: any) => map.removeLayer(marker))
  }
  ;(window as any)._markers = []

  const colors: Record<number, string> = {
    1: '#00cc44',
    2: '#66ff66',
    3: '#ffcc00',
    4: '#ff6600',
    5: '#ff0000',
  }

  const markers: any[] = []

  objects.forEach((obj) => {
    const lat = Number(obj.latitude ?? obj.lat ?? obj.coordinates?.lat)
    const lng = Number(obj.longitude ?? obj.lng ?? obj.coordinates?.lng)
    if (Number.isNaN(lat) || Number.isNaN(lng)) return

    const conditionValue = obj.technical_condition ?? obj.condition
    const color = colors[conditionValue] || '#999999'

    const icon = (window as any).L.divIcon({
      className: '',
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

    const marker = (window as any).L.marker([lat, lng], { icon }).addTo(map)
    const region = obj.region ?? '—'
    const type = obj.resource_type ?? obj.resourceType ?? '—'
    const pdfLink = obj.pdf_url ?? obj.pdfUrl
      ? `<a href="${obj.pdf_url ?? obj.pdfUrl}" target="_blank" rel="noopener">PDF паспорт</a>`
      : ''

    marker.bindPopup(
      `
        <div class="csv-marker-popup">
          <strong>${obj.name ?? 'Водный объект'}</strong><br/>
          Регион: ${region}<br/>
          Тип: ${type}<br/>
          ${pdfLink}
        </div>
      `,
    )

    ;(window as any)._markers.push(marker)
    markers.push(marker)
  })

  if (markers.length) {
    const bounds = (window as any).L.latLngBounds(markers.map((m: any) => m.getLatLng()))
    map.fitBounds(bounds, { padding: [40, 40] })
  }
}
