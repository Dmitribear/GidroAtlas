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

import { getObjectImage } from './objectImages'

const resourceLabels: Record<string, string> = {
  lake: 'Озеро',
  canal: 'Канал',
  reservoir: 'Водохранилище',
}

// SVG иконки для попапа
const icons = {
  location: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkM4LjEzIDIgNSA1LjEzIDUgOUMyMCAxNCAxMiAyMiAxMiAyMkMxMiAyMiA0IDE0IDUgOUM1IDUuMTMgOC4xMyAyIDEyIDJaIiBzdHJva2U9IiM2NzcxODAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=',
  water: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkMxNyA3IDEyIDIyIDcgN0MxMiAyIDE3IDcgMTIgMloiIGZpbGw9IiM2MTg1RjUiLz48L3N2Zz4=',
  fauna: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkMxMiA0IDkgNiA5IDlDMTIgMTIgMTIgMTggMTIgMjJDMTIgMTggMTIgMTIgMTUgOUMxNSA2IDEyIDQgMTIgMloiIGZpbGw9IiMxMEI5ODEiLz48L3N2Zz4=',
  calendar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIzIiB5PSI0IiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSIyIiBzdHJva2U9IiM2NzcxODAiIHN0cm9rZS13aWR0aD0iMS41Ii8+PHBhdGggZD0iTTE2IDJWMThNOCAyVjE4TTMgOEgxOSIgc3Ryb2tlPSIjNjc3MTgwIiBzdHJva2Utd2lkdGg9IjEuNSIvPjwvc3ZnPg==',
  coordinates: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgc3Ryb2tlPSIjNjc3MTgwIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjIiIGZpbGw9IiM2NzcxODAiLz48L3N2Zz4=',
  file: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTQgMlY4SDIwTTE0IDJIMTBDOS40NDc3MiAyIDkgMi40NDc3MiA5IDNWMjFDOSAyMS41NTIzIDkuNDQ3NzIgMjIgMTAgMjJIMjBDMjAuNTUyMyAyMiAyMSAyMS41NTIzIDIxIDIxVjhaIiBzdHJva2U9IiMyNTYzRUIiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=',
}

function buildPopupHtml(obj: any, hidePriority = false) {
  // Используем утилиту для получения изображения
  const image = obj.image || getObjectImage(obj.name, 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=800&q=80')
  
  const name = obj.name ?? 'Без названия'
  const region = obj.region ?? 'Регион не указан'
  const typeKey = obj.resource_type ?? obj.resourceType ?? ''
  const type = resourceLabels[typeKey] || 'Ресурс'
  const conditionValueRaw = Number(obj.technical_condition ?? obj.condition ?? 0)
  const conditionText = hidePriority ? 'Доступно эксперту' : conditionLabels[conditionValueRaw] || 'Нет данных'
  const pdfLink = obj.pdf_url ?? obj.pdfUrl
  const priorityRaw = obj.priority ?? ''
  let priorityLabel = ''
  if (!hidePriority && priorityRaw !== '' && priorityRaw !== null) {
    if (!Number.isNaN(Number(priorityRaw))) {
      priorityLabel = `P${priorityRaw}`
    } else {
      const map: Record<string, string> = { high: 'P3', medium: 'P2', low: 'P1' }
      priorityLabel = map[String(priorityRaw).toLowerCase()] || ''
    }
  }

  const badgeBg = hidePriority ? '#E2E8F0' : conditionBadgeBg[conditionValueRaw] || '#E2E8F0'
  const badgeFontColor = hidePriority ? '#475569' : conditionBadgeColor[conditionValueRaw] || '#475569'
  const waterType = (obj.water_type ?? obj.waterType) === 'fresh' ? 'Пресная' : 'Непресная'
  const fauna = (obj.fauna ?? obj.hasFauna) ? 'Есть' : 'Нет'
  const passportDate = obj.passport_date ?? obj.passportDate ?? ''
  const coords = formatCoordinates(
    Number(obj.latitude ?? obj.coordinates?.lat),
    Number(obj.longitude ?? obj.coordinates?.lng),
  )

  return `
    <div style="width:240px;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.15);background:#fff;font-family:'Inter','Helvetica',sans-serif;border:1px solid #e2e8f0;">
      <div style="position:relative;height:100px;overflow:hidden;">
        <img src="${image}" alt="${name}" style="width:100%;height:100%;object-fit:cover;display:block;" />
        <div style="position:absolute;inset:0;background:linear-gradient(to bottom,transparent 0%,rgba(0,0,0,0.3) 100%);"></div>
        <div style="position:absolute;top:6px;left:6px;padding:3px 8px;border-radius:999px;background:rgba(15,23,42,0.85);backdrop-filter:blur(4px);color:#fff;font-size:9px;font-weight:600;display:flex;align-items:center;gap:4px;">
          <span style="width:4px;height:4px;background:#60a5fa;border-radius:50%;"></span>
          ${type}
        </div>
        ${
          priorityLabel
            ? `<div style="position:absolute;top:6px;right:6px;padding:3px 7px;border-radius:999px;background:#EEF2FF;color:#4338CA;font-size:9px;font-weight:700;">${priorityLabel}</div>`
            : ''
        }
      </div>
      <div style="padding:10px 12px 12px;">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
          <span style="padding:3px 8px;border-radius:6px;background:${badgeBg};color:${badgeFontColor};font-size:9px;font-weight:600;">${conditionText}</span>
        </div>
        <div style="font-size:14px;font-weight:700;color:#0f172a;line-height:1.3;margin-bottom:6px;">${name}</div>
        <div style="display:flex;flex-direction:column;gap:5px;font-size:10px;color:#475569;">
          <div style="display:flex;align-items:center;gap:5px;">
            <img src="${icons.location}" alt="" style="width:11px;height:11px;opacity:0.6;" />
            <span>${region}</span>
          </div>
          <div style="display:flex;align-items:center;gap:5px;">
            <img src="${icons.water}" alt="" style="width:11px;height:11px;opacity:0.6;" />
            <span>${waterType}</span>
          </div>
          <div style="display:flex;align-items:center;gap:5px;">
            <img src="${icons.fauna}" alt="" style="width:11px;height:11px;opacity:0.6;" />
            <span>Фауна: ${fauna}</span>
          </div>
          ${passportDate ? `
          <div style="display:flex;align-items:center;gap:5px;">
            <img src="${icons.calendar}" alt="" style="width:11px;height:11px;opacity:0.6;" />
            <span>${passportDate}</span>
          </div>
          ` : ''}
          <div style="display:flex;align-items:center;gap:5px;">
            <img src="${icons.coordinates}" alt="" style="width:11px;height:11px;opacity:0.6;" />
            <span style="font-size:9px;">${coords}</span>
          </div>
        </div>
        ${
          pdfLink
            ? `<a href="${pdfLink}" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:5px;margin-top:8px;padding:6px 10px;background:#F0F9FF;border-radius:8px;font-size:10px;font-weight:600;color:#2563eb;text-decoration:none;transition:background 0.2s;">
              <img src="${icons.file}" alt="" style="width:12px;height:12px;" />
              Открыть паспорт (PDF)
            </a>`
            : '<div style="margin-top:8px;padding:6px 10px;background:#F8F9FA;border-radius:8px;font-size:10px;color:#94a3b8;text-align:center;">Паспорт не прикреплён</div>'
        }
      </div>
    </div>
  `
}

export function renderMarkers(map: any, objects: any[] = [], selectedId?: string | null, hidePriority = false) {
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
    const color = hidePriority ? '#ffffff' : obj.markerColor || conditionColors[conditionValue] || '#999999'

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

    marker.bindPopup(buildPopupHtml(obj, hidePriority), {
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

function formatCoordinates(latValue: number, lonValue: number) {
  if (Number.isNaN(latValue) || Number.isNaN(lonValue)) return '—'
  const format = (value: number, axis: 'lat' | 'lon') => {
    const abs = Math.abs(value)
    const degrees = Math.floor(abs)
    const minutes = Math.round((abs - degrees) * 60)
    const suffix = axis === 'lat' ? (value >= 0 ? 'с. ш.' : 'ю. ш.') : value >= 0 ? 'в. д.' : 'з. д.'
    return `${degrees}°${minutes.toString().padStart(2, '0')}′ ${suffix}`
  }
  return `${format(latValue, 'lat')}, ${format(lonValue, 'lon')}`
}
