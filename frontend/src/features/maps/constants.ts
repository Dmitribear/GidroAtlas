export const REGION_ALIASES: Record<string, string> = {
  'жетысу': 'Жетысу',
  jetysu: 'Жетысу',
  'жетису': 'Жетысу',
  'жетісу': 'Жетысу',
  'область жетысу': 'Жетысу',

  'карагандинская': 'Карагандинская',
  karagandinskaya: 'Карагандинская',
  караганда: 'Карагандинская',
  'карагандинская область': 'Карагандинская',

  'вко': 'ВКО',
  'вко.': 'ВКО',
  'восточно-казахстанская': 'ВКО',
  'восточно-казахстанская область': 'ВКО',

  'алматинская': 'Алматинская',
  'алматинская область': 'Алматинская',
  almaty: 'Алматинская',
  'alma-ata': 'Алматинская',
  алматы: 'Алматинская',

  'туркестанская': 'Туркестанская',
  turkestanskaya: 'Туркестанская',
  туркестан: 'Туркестанская',
}

export function normalizeRegionName(value: string | null | undefined): string {
  if (!value) return ''
  const key = value.trim().toLowerCase()
  return REGION_ALIASES[key] || value.trim()
}

export const REGION_OPTIONS = Array.from(new Set(Object.values(REGION_ALIASES))).sort()
