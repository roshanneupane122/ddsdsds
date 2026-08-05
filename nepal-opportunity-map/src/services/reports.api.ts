import type { Report, ReportRequest, PaginatedResponse } from '@/types'

// Reports are generated client-side (PDF/CSV via jsPDF + html2canvas).
// The backend does not currently expose a /reports API endpoint.
// This module provides a thin abstraction for local mock report history
// that can be wired to a backend in the future.

let _localReports: Report[] = []

export const reportsApi = {
  /** List locally stored reports (client-side simulation) */
  list: async (): Promise<PaginatedResponse<Report>> => {
    return {
      data: _localReports,
      total: _localReports.length,
      page: 1,
      pageSize: 20,
      hasNext: false,
      hasPrev: false,
    }
  },

  /** Register a newly generated report locally */
  generate: async (request: ReportRequest): Promise<Report> => {
    const newReport: Report = {
      id: `report-${Date.now()}`,
      title: request.title || `${request.type.toUpperCase()} Report`,
      type: request.type,
      format: request.format,
      status: 'ready',
      createdAt: new Date().toISOString(),
      generatedAt: new Date().toISOString(),
      municipalityIds: request.municipalityIds,
    }
    _localReports = [newReport, ..._localReports]
    return newReport
  },

  /** Get report status */
  status: async (id: string): Promise<Report> => {
    const found = _localReports.find((r) => r.id === id)
    if (!found) throw new Error(`Report ${id} not found`)
    return found
  },

  /** Download a report (returns undefined since it's local) */
  download: async (_id: string): Promise<{ url: string }> => {
    return { url: '' }
  },

  /** Delete a report */
  delete: async (id: string): Promise<void> => {
    _localReports = _localReports.filter((r) => r.id !== id)
  },
}
