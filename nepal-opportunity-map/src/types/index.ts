// ============================================================
// Shared TypeScript types for Nepal Opportunity Map
// All backend API shapes are defined here.
// Services layer uses these types — components import from here.
// ============================================================

// ──────────────────────────────────────────────
// Geography / GeoJSON
// ──────────────────────────────────────────────

export interface Coordinates {
  lat: number
  lng: number
}

export interface BoundingBox {
  north: number
  south: number
  east: number
  west: number
}

// ──────────────────────────────────────────────
// Province
// ──────────────────────────────────────────────

export type ProvinceNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7

export interface Province {
  id: ProvinceNumber
  name: string
  nameNepali: string
  headquarter: string
  districtCount: number
  municipalityCount: number
}

// ──────────────────────────────────────────────
// Municipality (Local Unit)
// Based on 2017 Nepal federal restructuring — 753 local units
// ──────────────────────────────────────────────

export type MunicipalityType =
  | 'metropolitan_city'
  | 'sub_metropolitan_city'
  | 'municipality'
  | 'rural_municipality'

export interface MunicipalityListItem {
  id: string
  name: string
  nameNepali: string
  type: MunicipalityType
  district: string
  province: ProvinceNumber
  population: number
  area: number // km²
  center: Coordinates
  // Composite scores (0–100) for choropleth layers
  agricultureScore: number
  tourismScore: number
  infrastructureScore: number
  economicScore: number
  digitalScore: number
}

export interface MunicipalityDetail extends MunicipalityListItem {
  boundingBox: BoundingBox
  indicators: MunicipalityIndicators
  resources: MunicipalityResources
  demographics: Demographics
  opportunities: Recommendation[]
  lastUpdated: string // ISO date
  geom?: unknown
}

export interface MunicipalityIndicators {
  // Agriculture
  cultivatedLandPercent: number
  majorCrops: string[]
  irrigatedLandPercent: number
  agriculturalYield: number // metric tons/hectare
  // Tourism
  annualVisitors: number
  hotelCount: number
  touristSites: number
  avgStayDays: number
  // Infrastructure
  roadLengthKm: number
  electrificationPercent: number
  internetPenetrationPercent: number
  cleanWaterAccessPercent: number
  bankBranchCount: number
  hospitalCount: number
  // Economics
  gdpPerCapitaUSD: number
  registeredBusinesses: number
  exportValueUSD: number
  unemploymentPercent: number
}

export interface MunicipalityResources {
  naturalResources: string[]
  agriculturalProducts: string[]
  touristAttractions: TouristAttraction[]
  industries: Industry[]
  infrastructure: InfrastructureItem[]
}

export interface TouristAttraction {
  name: string
  type: 'heritage' | 'natural' | 'religious' | 'adventure' | 'cultural'
  rating: number // 1–5
  annualVisitors?: number
}

export interface Industry {
  name: string
  sector: IndustrySector
  employeeCount: number
  annualRevenueUSD?: number
  established?: number // year
}

export type IndustrySector =
  | 'agriculture'
  | 'tourism'
  | 'manufacturing'
  | 'services'
  | 'construction'
  | 'technology'
  | 'energy'
  | 'mining'
  | 'trade'

export interface InfrastructureItem {
  name: string
  type: 'road' | 'airport' | 'hospital' | 'school' | 'market' | 'power_plant' | 'irrigation'
  status: 'operational' | 'under_construction' | 'planned'
}

export interface Demographics {
  totalPopulation: number
  malePopulation: number
  femalePopulation: number
  populationDensity: number // per km²
  literacyRate: number
  urbanPopulationPercent: number
  workingAgePopulationPercent: number
  ageDistribution: { group: string; percent: number }[]
  ethnicGroups: { group: string; percent: number }[]
}

// ──────────────────────────────────────────────
// Map Layers / Choropleth
// ──────────────────────────────────────────────

export type ChoroplethLayerId =
  | 'agriculture'
  | 'tourism'
  | 'infrastructure'
  | 'economic'
  | 'digital'
  | 'population'

export interface MapLayer {
  id: ChoroplethLayerId
  label: string
  description: string
  unit: string
  colorScale: string[] // CSS color stops for legend
  dataKey: keyof MunicipalityListItem
}

// ──────────────────────────────────────────────
// AI Recommendations
// ──────────────────────────────────────────────

export type OpportunityCategory =
  | 'agribusiness'
  | 'eco_tourism'
  | 'manufacturing'
  | 'digital_services'
  | 'renewable_energy'
  | 'healthcare'
  | 'education'
  | 'infrastructure'
  | 'export_trade'
  | 'financial_services'

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export interface Recommendation {
  id: string
  municipalityId: string
  opportunityId?: string
  modelVersion?: string
  municipalityName: string
  province: ProvinceNumber
  title: string
  category: OpportunityCategory
  confidence: ConfidenceLevel
  confidenceScore: number // 0–1
  summary: string
  explanation: string
  whyThisFits: string[]
  estimatedInvestmentUSD: { min: number; max: number }
  estimatedROIPercent: { min: number; max: number }
  timeToMarketMonths: number
  riskFactors: string[]
  supportingData: SupportingDataPoint[]
  tags: string[]
  createdAt: string // ISO date
}

export interface SupportingDataPoint {
  label: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down' | 'stable'
}

// ──────────────────────────────────────────────
// Reports
// ──────────────────────────────────────────────

export type ReportType = 'municipality' | 'comparison' | 'sector' | 'province'
export type ReportFormat = 'pdf' | 'csv' | 'json'
export type ReportStatus = 'pending' | 'generating' | 'ready' | 'failed'

export interface ReportRequest {
  type: ReportType
  format: ReportFormat
  municipalityIds: string[]
  includeRecommendations: boolean
  includeDemographics: boolean
  includeInfrastructure: boolean
  title?: string
}

export interface Report {
  id: string
  title: string
  type: ReportType
  format: ReportFormat
  status: ReportStatus
  downloadUrl?: string
  createdAt: string
  generatedAt?: string
  municipalityIds: string[]
}

// ──────────────────────────────────────────────
// Auth / User
// ──────────────────────────────────────────────

export type UserRole = 'ADMIN' | 'CITIZEN'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  organization?: string
  province?: ProvinceNumber
  createdAt: string
  avatarUrl?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number // Unix timestamp
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  name: string
  role?: UserRole
  organization?: string
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}

// ──────────────────────────────────────────────
// API Response wrappers
// ──────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ApiError {
  statusCode: number
  message: string
  details?: Record<string, string[]>
}

// ──────────────────────────────────────────────
// Filter / Search state
// ──────────────────────────────────────────────

export interface MunicipalityFilter {
  search: string
  province: ProvinceNumber | null
  type: MunicipalityType | null
  minPopulation: number | null
  maxPopulation: number | null
  minAgricultureScore: number | null
  minTourismScore: number | null
  minInfrastructureScore: number | null
}

export interface RecommendationFilter {
  search: string
  province: ProvinceNumber | null
  category: OpportunityCategory | null
  confidence: ConfidenceLevel | null
  minInvestmentUSD: number | null
  maxInvestmentUSD: number | null
}

// ──────────────────────────────────────────────
// Compare
// ──────────────────────────────────────────────

export interface CompareSelection {
  municipalities: MunicipalityListItem[]
  maxSelections: 4
}
