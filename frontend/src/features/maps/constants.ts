export const REGION_ALIASES: Record<string, string> = {
  // Казахстан
  'жетысу': 'Жетысу',
  'jetysu': 'Жетысу',
  'жетыcу': 'Жетысу',
  'жетысуская': 'Жетысу',
  'карагандинская': 'Карагандинская',
  'karagandinskaya': 'Карагандинская',
  'алматинская': 'Алматинская',
  'almata': 'Алматинская',
  'вко': 'ВКО',
  'вк': 'ВКО',
  'восточно-казахстанская': 'ВКО',
  'turkestanskaya': 'Туркестанская',
  'туркестанская': 'Туркестанская',
}

export function normalizeRegionName(value: string | null | undefined): string {
  if (!value) return ''
  const key = value.trim().toLowerCase()
  return REGION_ALIASES[key] || value.trim()
}

export const REGION_OPTIONS = Array.from(new Set(Object.values(REGION_ALIASES))).sort()
