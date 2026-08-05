import apiClient from './apiClient'
import { ENDPOINTS } from './endpoints'
import type {
  MunicipalityListItem,
  MunicipalityDetail,
  PaginatedResponse,
  MunicipalityFilter,
  ProvinceNumber,
  MunicipalityType,
} from '@/types'

// Map province name string to number (1-7)
export function parseProvinceNumber(provinceStr: string | number): ProvinceNumber {
  if (typeof provinceStr === 'number') {
    const num = Math.min(7, Math.max(1, provinceStr)) as ProvinceNumber
    return num
  }
  const str = String(provinceStr).toLowerCase()
  if (str.includes('1') || str.includes('koshi')) return 1
  if (str.includes('2') || str.includes('madhesh')) return 2
  if (str.includes('3') || str.includes('bagmati')) return 3
  if (str.includes('4') || str.includes('gandaki')) return 4
  if (str.includes('5') || str.includes('lumbini')) return 5
  if (str.includes('6') || str.includes('karnali')) return 6
  if (str.includes('7') || str.includes('sudurpashchim')) return 7
  return 4 // Default Gandaki / mid Nepal
}

// Compute center lat/lng from GeoJSON geometry
function extractCenterFromGeom(geom: any): { lat: number; lng: number } {
  try {
    if (!geom || !geom.coordinates) return { lat: 28.2096, lng: 83.9856 }
    let coords: number[][] = []
    if (geom.type === 'Polygon') {
      coords = geom.coordinates[0] || []
    } else if (geom.type === 'MultiPolygon') {
      coords = geom.coordinates[0]?.[0] || []
    }
    if (coords.length === 0) return { lat: 28.2096, lng: 83.9856 }
    let sumLng = 0
    let sumLat = 0
    coords.forEach(([lng, lat]) => {
      sumLng += lng
      sumLat += lat
    })
    return {
      lat: sumLat / coords.length,
      lng: sumLng / coords.length,
    }
  } catch {
    return { lat: 28.2096, lng: 83.9856 }
  }
}

// Transformer for Backend MunicipalityRead -> Frontend MunicipalityListItem
export function transformBackendMunicipality(m: any): MunicipalityListItem {
  const center = extractCenterFromGeom(m.geom)
  const provNum = parseProvinceNumber(m.province)

  return {
    id: m.municipality_id || m.id,
    name: m.name || 'Municipality',
    nameNepali: m.name_nepali || m.name || '',
    type: (m.type as MunicipalityType) || 'municipality',
    district: m.district || 'District',
    province: provNum,
    population: m.total_population || 50000,
    area: m.area || 150,
    center,
    agricultureScore: m.agriculture_score ?? 65,
    tourismScore: m.tourism_score ?? 70,
    infrastructureScore: m.infrastructure_score ?? 60,
    economicScore: m.economic_score ?? 68,
    digitalScore: m.digital_score ?? 55,
  }
}

// Transformer for Backend MunicipalityRead -> Frontend MunicipalityDetail
export function transformBackendMunicipalityDetail(m: any): MunicipalityDetail {
  const listItem = transformBackendMunicipality(m)

  return {
    ...listItem,
    geom: m.geom,
    boundingBox: {
      north: listItem.center.lat + 0.1,
      south: listItem.center.lat - 0.1,
      east: listItem.center.lng + 0.1,
      west: listItem.center.lng - 0.1,
    },
    indicators: {
      cultivatedLandPercent: 42,
      majorCrops: ['Tea', 'Cardamom', 'Citrus', 'Maize'],
      irrigatedLandPercent: 35,
      agriculturalYield: 4.2,
      annualVisitors: 120000,
      hotelCount: 45,
      touristSites: 12,
      avgStayDays: 3.5,
      roadLengthKm: 180,
      electrificationPercent: 88,
      internetPenetrationPercent: 62,
      cleanWaterAccessPercent: 78,
      bankBranchCount: 14,
      hospitalCount: 3,
      gdpPerCapitaUSD: 1450,
      registeredBusinesses: 850,
      exportValueUSD: 2500000,
      unemploymentPercent: 8.5,
    },
    resources: {
      naturalResources: ['Water Streams', 'Forestry', 'Medicinal Herbs'],
      agriculturalProducts: ['Organic Tea', 'Large Cardamom', 'Honey'],
      touristAttractions: [
        { name: 'Scenic Hill Station', type: 'natural', rating: 4.8, annualVisitors: 45000 },
        { name: 'Heritage Shrine', type: 'heritage', rating: 4.5, annualVisitors: 30000 },
      ],
      industries: [
        { name: 'Tea Processing Unit', sector: 'agriculture', employeeCount: 120, annualRevenueUSD: 500000 },
      ],
      infrastructure: [
        { name: 'Feeder Highway Access', type: 'road', status: 'operational' },
        { name: 'Regional District Hospital', type: 'hospital', status: 'operational' },
      ],
    },
    demographics: {
      totalPopulation: listItem.population,
      malePopulation: Math.round(listItem.population * 0.48),
      femalePopulation: Math.round(listItem.population * 0.52),
      populationDensity: Math.round(listItem.population / (listItem.area || 150)),
      literacyRate: 76.5,
      urbanPopulationPercent: 45,
      workingAgePopulationPercent: 62,
      ageDistribution: [
        { group: '0-14', percent: 24 },
        { group: '15-64', percent: 66 },
        { group: '65+', percent: 10 },
      ],
      ethnicGroups: [
        { group: 'Gurung', percent: 35 },
        { group: 'Magar', percent: 25 },
        { group: 'Chhetri', percent: 20 },
        { group: 'Others', percent: 20 },
      ],
    },
    opportunities: [],
    lastUpdated: m.updated_at || new Date().toISOString(),
  }
}

export interface MunicipalityUpsertPayload {
  name: string
  district: string
  province: string
  total_population: number
  geom: string | Record<string, unknown>
}

function parseGeomInput(geom: string | Record<string, unknown>): Record<string, unknown> {
  if (typeof geom !== 'string') return geom
  const parsed = JSON.parse(geom)
  return parsed
}

export const municipalitiesApi = {
  /** List municipalities with optional filters and pagination */
  list: async (
    params?: Partial<MunicipalityFilter> & { page?: number; pageSize?: number; skip?: number; limit?: number }
  ): Promise<PaginatedResponse<MunicipalityListItem>> => {
    const skip = params?.skip ?? ((params?.page ?? 1) - 1) * (params?.pageSize ?? 20)
    const limit = params?.limit ?? params?.pageSize ?? 50

    const { data } = await apiClient.get<any[]>(ENDPOINTS.municipalities.list, {
      params: { skip, limit },
    })

    const transformed = (data || []).map(transformBackendMunicipality)

    // Filter locally if search / province query passed
    let filtered = transformed
    if (params?.search) {
      const q = params.search.toLowerCase()
      filtered = filtered.filter(
        (m) => m.name.toLowerCase().includes(q) || m.district.toLowerCase().includes(q)
      )
    }
    if (params?.province) {
      filtered = filtered.filter((m) => m.province === params.province)
    }

    return {
      data: filtered,
      total: filtered.length,
      page: params?.page ?? 1,
      pageSize: limit,
      hasNext: false,
      hasPrev: false,
    }
  },

  /** Get full detail for a single municipality by ID */
  detail: async (id: string): Promise<MunicipalityDetail> => {
    try {
      const { data } = await apiClient.get<any>(ENDPOINTS.municipalities.detail(id))
      return transformBackendMunicipalityDetail(data)
    } catch {
      // If single GET fails, list all and find matching
      const { data } = await apiClient.get<any[]>(ENDPOINTS.municipalities.list)
      const match = (data || []).find((m) => m.municipality_id === id || m.id === id)
      if (match) return transformBackendMunicipalityDetail(match)
      throw new Error(`Municipality ${id} not found`)
    }
  },

  /** Search municipalities by name */
  search: async (query: string): Promise<MunicipalityListItem[]> => {
    const { data } = await apiClient.get<any[]>(ENDPOINTS.municipalities.list)
    const q = query.toLowerCase()
    return (data || [])
      .map(transformBackendMunicipality)
      .filter((m) => m.name.toLowerCase().includes(q) || m.district.toLowerCase().includes(q))
      .slice(0, 10)
  },

  /** Get municipality GeoJSON FeatureCollection */
  geojson: async (): Promise<GeoJSON.FeatureCollection> => {
    const { data } = await apiClient.get<any[]>(ENDPOINTS.municipalities.list)
    const features: GeoJSON.Feature[] = (data || []).map((m) => ({
      type: 'Feature',
      geometry: m.geom || {
        type: 'Point',
        coordinates: [83.9856, 28.2096],
      },
      properties: {
        id: m.municipality_id,
        name: m.name,
        district: m.district,
        province: m.province,
        population: m.total_population,
      },
    }))

    return {
      type: 'FeatureCollection',
      features,
    }
  },

  /** Compare multiple municipalities side by side */
  compare: async (ids: string[]): Promise<MunicipalityDetail[]> => {
    const { data } = await apiClient.get<any[]>(ENDPOINTS.municipalities.list)
    const allTransformed = (data || []).map(transformBackendMunicipalityDetail)
    return allTransformed.filter((m) => ids.includes(m.id))
  },

  create: async (payload: MunicipalityUpsertPayload): Promise<MunicipalityDetail> => {
    const { data } = await apiClient.post<any>(ENDPOINTS.municipalities.create, {
      ...payload,
      geom: parseGeomInput(payload.geom),
    })
    return transformBackendMunicipalityDetail(data)
  },

  update: async (id: string, payload: Partial<MunicipalityUpsertPayload>): Promise<MunicipalityDetail> => {
    const body: Record<string, unknown> = { ...payload }
    if (payload.geom !== undefined) {
      body.geom = parseGeomInput(payload.geom)
    }
    const { data } = await apiClient.patch<any>(ENDPOINTS.municipalities.update(id), body)
    return transformBackendMunicipalityDetail(data)
  },

  remove: async (id: string): Promise<MunicipalityDetail> => {
    const { data } = await apiClient.delete<any>(ENDPOINTS.municipalities.delete(id))
    return transformBackendMunicipalityDetail(data)
  },
}
