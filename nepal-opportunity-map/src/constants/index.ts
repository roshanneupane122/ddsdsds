import type { MunicipalityType, ChoroplethLayerId, ProvinceNumber } from '@/types'

// ──────────────────────────────────────────────
// Municipality type labels
// ──────────────────────────────────────────────
export const MUNICIPALITY_TYPE_LABELS: Record<MunicipalityType, string> = {
  metropolitan_city: 'Metropolitan City',
  sub_metropolitan_city: 'Sub-Metropolitan City',
  municipality: 'Municipality',
  rural_municipality: 'Rural Municipality',
}

export const MUNICIPALITY_TYPE_SHORT: Record<MunicipalityType, string> = {
  metropolitan_city: 'Metro',
  sub_metropolitan_city: 'Sub-Metro',
  municipality: 'Mun.',
  rural_municipality: 'R.M.',
}

// ──────────────────────────────────────────────
// Province data — Nepal's 7 provinces (2017 restructuring)
// ──────────────────────────────────────────────
export const PROVINCES: {
  id: ProvinceNumber
  name: string
  nameNepali: string
  headquarter: string
}[] = [
  { id: 1, name: 'Koshi Province', nameNepali: 'कोशी प्रदेश', headquarter: 'Biratnagar' },
  { id: 2, name: 'Madhesh Province', nameNepali: 'मधेश प्रदेश', headquarter: 'Janakpur' },
  { id: 3, name: 'Bagmati Province', nameNepali: 'बागमती प्रदेश', headquarter: 'Hetauda' },
  { id: 4, name: 'Gandaki Province', nameNepali: 'गण्डकी प्रदेश', headquarter: 'Pokhara' },
  { id: 5, name: 'Lumbini Province', nameNepali: 'लुम्बिनी प्रदेश', headquarter: 'Butwal' },
  { id: 6, name: 'Karnali Province', nameNepali: 'कर्णाली प्रदेश', headquarter: 'Birendranagar' },
  { id: 7, name: 'Sudurpashchim Province', nameNepali: 'सुदूरपश्चिम प्रदेश', headquarter: 'Dhangadhi' },
]

// ──────────────────────────────────────────────
// Choropleth map layers
// ──────────────────────────────────────────────
export const MAP_LAYERS: Record<
  ChoroplethLayerId,
  {
    id: ChoroplethLayerId
    label: string
    description: string
    unit: string
    colorScale: string[]
    dataKey: string
  }
> = {
  agriculture: {
    id: 'agriculture',
    label: 'Agriculture Index',
    description: 'Composite score of agricultural output, irrigated land, and yield potential',
    unit: 'Score (0–100)',
    colorScale: ['#f0f4f8', '#c8ecdf', '#52B788', '#2D6A4F', '#1B3A4B'],
    dataKey: 'agricultureScore',
  },
  tourism: {
    id: 'tourism',
    label: 'Tourism Index',
    description: 'Annual visitors, tourist sites, accommodation capacity, and average stay',
    unit: 'Score (0–100)',
    colorScale: ['#f0f8fd', '#b8e0f2', '#8ECAE6', '#3d8fb5', '#214c6f'],
    dataKey: 'tourismScore',
  },
  infrastructure: {
    id: 'infrastructure',
    label: 'Infrastructure Score',
    description: 'Road network, electrification, internet penetration, water access, banking',
    unit: 'Score (0–100)',
    colorScale: ['#fef8f0', '#fbd9b3', '#F4A261', '#e8864a', '#b0511f'],
    dataKey: 'infrastructureScore',
  },
  economic: {
    id: 'economic',
    label: 'Economic Activity',
    description: 'GDP per capita, registered businesses, export value, and employment rate',
    unit: 'Score (0–100)',
    colorScale: ['#f5f0fb', '#d4b8e8', '#9b59b6', '#7d3c98', '#4a235a'],
    dataKey: 'economicScore',
  },
  digital: {
    id: 'digital',
    label: 'Digital Readiness',
    description: 'Internet penetration, mobile connectivity, and digital service availability',
    unit: 'Score (0–100)',
    colorScale: ['#f0f4f8', '#c5d4dc', '#5b899c', '#3e748b', '#1B3A4B'],
    dataKey: 'digitalScore',
  },
  population: {
    id: 'population',
    label: 'Population Density',
    description: 'Population per square kilometre',
    unit: 'persons/km²',
    colorScale: ['#fff5f0', '#fcc09b', '#f4734a', '#c23b22', '#7f0000'],
    dataKey: 'population',
  },
  opportunity: {
    id: 'opportunity',
    label: 'Business Opportunity',
    description: 'Calculated business opportunity score based on sector potentials and demand',
    unit: 'Score (0–100)',
    colorScale: ['#f7fedf', '#d7f7a7', '#8cd96a', '#43ad34', '#157f15'],
    dataKey: 'economicScore', // Proxy field mapping in ListItem
  },
  gap: {
    id: 'gap',
    label: 'Infrastructure Gap',
    description: 'Priority of infrastructure deficits (electricity, internet, healthcare access)',
    unit: 'Deficit priority score',
    colorScale: ['#fff5f5', '#ffe3e3', '#ffc9c9', '#ffa8a8', '#f03e3e'],
    dataKey: 'infrastructureScore', // Inverted logic proxy
  },
}

export const MAP_LAYER_LIST = Object.values(MAP_LAYERS)

// ──────────────────────────────────────────────
// Opportunity categories
// ──────────────────────────────────────────────
export const OPPORTUNITY_CATEGORIES = [
  { value: 'agribusiness', label: 'Agribusiness', icon: '🌾' },
  { value: 'eco_tourism', label: 'Eco-Tourism', icon: '🏔️' },
  { value: 'manufacturing', label: 'Manufacturing', icon: '🏭' },
  { value: 'digital_services', label: 'Digital Services', icon: '💻' },
  { value: 'renewable_energy', label: 'Renewable Energy', icon: '⚡' },
  { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'infrastructure', label: 'Infrastructure', icon: '🏗️' },
  { value: 'export_trade', label: 'Export & Trade', icon: '🚢' },
  { value: 'financial_services', label: 'Financial Services', icon: '🏦' },
] as const

// ──────────────────────────────────────────────
// Nepal geographic bounds (for map fitting)
// ──────────────────────────────────────────────
export const NEPAL_BOUNDS = {
  west: 80.058,
  south: 26.347,
  east: 88.201,
  north: 30.447,
} as const

export const NEPAL_CENTER = { lat: 27.6333, lng: 83.4333 } as const
export const NEPAL_DEFAULT_ZOOM = 7.5

// ──────────────────────────────────────────────
// Query keys — for TanStack Query cache management
// ──────────────────────────────────────────────
export const QUERY_KEYS = {
  municipalities: {
    all: ['municipalities'] as const,
    list: (filters: Record<string, unknown>) => ['municipalities', 'list', filters] as const,
    detail: (id: string) => ['municipalities', 'detail', id] as const,
    geojson: ['municipalities', 'geojson'] as const,
    search: (q: string) => ['municipalities', 'search', q] as const,
    compare: (ids: string[]) => ['municipalities', 'compare', ids.join(',')] as const,
    recommendations: (id: string) => ['municipalities', id, 'recommendations'] as const,
  },
  recommendations: {
    all: ['recommendations'] as const,
    list: (filters: Record<string, unknown>) => ['recommendations', 'list', filters] as const,
    detail: (id: string) => ['recommendations', 'detail', id] as const,
    featured: ['recommendations', 'featured'] as const,
  },
  reports: {
    all: ['reports'] as const,
    detail: (id: string) => ['reports', 'detail', id] as const,
  },
  auth: {
    me: ['auth', 'me'] as const,
  },
} as const
