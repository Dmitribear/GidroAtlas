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
  4: 'Плохое состояние',
  5: 'Аварийное состояние',
}

const conditionBadgeBg: Record<number, string> = {
  1: '#DCFCE7',
  2: '#E6F9D4',
  3: '#FFF4D6',
  4: '#FDE4D6',
  5: '#FFE0E0',
}

const conditionBadgeColor: Record<number, string> = {
  1: '#16A34A',
  2: '#48A921',
  3: '#C97700',
  4: '#DC4B15',
  5: '#B42318',
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

  const badgeBg = conditionBadgeBg[conditionValue] || '#E2E8F0'
  const badgeFontColor = conditionBadgeColor[conditionValue] || '#475569'

  return `
    <div style="width:200px;border-radius:18px;overflow:hidden;box-shadow:0 14px 38px rgba(15,23,42,0.2);background:#fff;font-family:'Inter','Helvetica',sans-serif;border:1px solid #e2e8f0;">
      <div style="position:relative;height:92px;overflow:hidden;">
        <img src="${image}" alt="${name}" style="width:100%;height:100%;object-fit:cover;display:block;" />
        <div style="position:absolute;top:8px;left:8px;padding:4px 10px;border-radius:999px;background:rgba(15,23,42,0.88);color:#fff;font-size:10px;font-weight:600;">
          ${type}
        </div>
        ${
          priorityLabel
            ? `<div style="position:absolute;top:8px;right:8px;padding:4px 8px;border-radius:999px;background:#EEF2FF;color:#4338CA;font-size:10px;font-weight:700;">${priorityLabel}</div>`
            : ''
        }
      </div>
      <div style="padding:12px 14px 14px;display:flex;flex-direction:column;gap:8px;">
        <span style="align-self:flex-start;padding:4px 10px;border-radius:999px;background:${badgeBg};color:${badgeFontColor};font-size:10px;font-weight:600;">${conditionText}</span>
        <div style="font-size:15px;font-weight:700;color:#0f172a;line-height:1.3;">${name}</div>
        <div style="font-size:11px;color:#475569;font-weight:500;">${region}</div>
        <div style="font-size:11px;color:#0f172a;">
          ${Number(obj.latitude ?? obj.coordinates?.lat)?.toFixed(3) ?? ''}°, ${Number(obj.longitude ?? obj.coordinates?.lng)?.toFixed(3) ?? ''}°
        </div>
        ${
          pdfLink
            ? `<a href="${pdfLink}" target="_blank" rel="noopener" style="font-size:12px;font-weight:600;color:#2563eb;text-decoration:none;">Открыть паспорт (PDF)</a>`
            : '<span style="font-size:11px;color:#94a3b8;">Паспорт не прикреплён</span>'
        }
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
