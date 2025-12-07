const conditionColors: Record<number, string> = {
  1: '#0ea05d',
  2: '#7acb64',
  3: '#f4b000',
  4: '#ed7b2f',
  5: '#e63946',
}

const conditionLabels: Record<number, string> = {
  1: 'Очень хорошее',
  2: 'Хорошее',
  3: 'Удовлетворительное',
  4: 'Неудовлетворительное',
  5: 'Аварийное',
}

const resourceLabels: Record<string, string> = {
  lake: 'Озеро',
  canal: 'Канал',
  reservoir: 'Водохранилище',
}

function buildPopupHtml(obj: any) {
  const image =
    obj.image ||
    'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=800&q=80'
  const name = obj.name ?? 'Без названия'
  const region = obj.region ?? 'Регион не указан'
  const typeKey = obj.resource_type ?? obj.resourceType ?? ''
  const type = resourceLabels[typeKey] || 'Ресурс'
  const conditionValue = Number(obj.technical_condition ?? obj.condition ?? 0)
  const conditionText = conditionLabels[conditionValue] || 'Нет данных'
  const conditionColor = conditionColors[conditionValue] || '#64748b'
  const badgeColor = obj.markerColor || conditionColor
  const pdfLink = obj.pdf_url ?? obj.pdfUrl
  const priorityRaw = obj.priority ?? ''
  let priorityLabel = ''
  if (priorityRaw !== '' && priorityRaw !== null) {
    if (!Number.isNaN(Number(priorityRaw))) {
      priorityLabel = `P${priorityRaw}`
    } else {
      const map: Record<string, string> = { high: 'P3', medium: 'P2', low: 'P1' }
      priorityLabel = map[String(priorityRaw).toLowerCase()] || ''
    }
  }

  return `
    <div style="width:170px;border-radius:6px;overflow:hidden;box-shadow:0 8px 18px rgba(15,23,42,0.16);background:#fff;font-family:'Inter','Helvetica',sans-serif;border:1px solid #e2e8f0;">
      <div style="position:relative;height:80px;overflow:hidden;background:#f8fafc;">
        <img src="${image}" alt="${name}" style="width:100%;height:100%;object-fit:cover;display:block;" />
        <div style="position:absolute;top:6px;left:6px;padding:3px 6px;border-radius:5px;background:rgba(17,24,39,0.82);color:#f8fafc;font-size:10px;font-weight:600;">
          ${type}
        </div>
      </div>
      <div style="padding:8px 10px 9px;display:flex;flex-direction:column;gap:6px;">
        <div style="font-size:13px;font-weight:800;color:#0f172a;line-height:1.25;">${name}</div>
        <div style="display:flex;align-items:center;gap:6px;font-size:10px;color:#475569;">
          <span style="padding:3px 6px;border-radius:5px;background:${badgeColor};color:#fff;font-weight:700;">${conditionText}</span>
          ${
            priorityLabel
              ? `<span style="padding:2px 6px;border-radius:5px;background:#eef2ff;color:#4338ca;font-weight:700;">${priorityLabel}</span>`
              : ''
          }
        </div>
        <div style="font-size:10px;color:#475569;line-height:1.4;">
          <div style="margin-bottom:3px;color:#0f172a;font-weight:600;">${region}</div>
          <div style="color:#0f172a;">${Number(obj.latitude ?? obj.coordinates?.lat)?.toFixed(3) ?? ''}, ${Number(obj.longitude ?? obj.coordinates?.lng)?.toFixed(3) ?? ''}</div>
          ${
            pdfLink
              ? `<a href="${pdfLink}" target="_blank" rel="noopener" style="color:#2563eb;font-weight:600;text-decoration:none;">Паспорт (PDF)</a>`
              : '<span style="color:#94a3b8;">Паспорт не прикреплён</span>'
          }
        </div>
      </div>
    </div>
  `
}

export function renderMarkers(map: any, objects: any[] = [], selectedId?: string | null) {
  if (typeof window === 'undefined' || typeof (window as any).L === 'undefined' || !map) {
    return
  }

  if ((window as any)._markers && Array.isArray((window as any)._markers)) {
    ;(window as any)._markers.forEach((marker: any) => map.removeLayer(marker))
  }
  ;(window as any)._markers = []

  const markers: any[] = []

  const list = selectedId ? objects.filter((o) => (o.id ?? o.object_id) === selectedId) : objects

  list.forEach((obj) => {
    const lat = Number(obj.latitude ?? obj.lat ?? obj.coordinates?.lat)
    const lng = Number(obj.longitude ?? obj.lng ?? obj.coordinates?.lng)
    if (Number.isNaN(lat) || Number.isNaN(lng)) return

    const conditionValue = obj.technical_condition ?? obj.condition
    const color = obj.markerColor || conditionColors[conditionValue] || '#999999'

    const icon = (window as any).L.divIcon({
      className: '',
      html: `
        <div style="
          width: 22px;
          height: 22px;
          background: ${color};
          border-radius: 50%;
          border: 2px solid #fff;
          box-shadow: 0 4px 14px rgba(0,0,0,0.35);
        "></div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    })

    const marker = (window as any).L.marker([lat, lng], { icon }).addTo(map)

    marker.bindPopup(buildPopupHtml(obj), {
      closeButton: false,
      offset: [0, -5],
      maxWidth: 280,
      className: 'zillow-like-popup',
    })

    ;(window as any)._markers.push(marker)
    markers.push(marker)
  })

  if (markers.length) {
    const bounds = (window as any).L.latLngBounds(markers.map((m: any) => m.getLatLng()))
    map.fitBounds(bounds, { padding: [40, 40] })
  }
}
