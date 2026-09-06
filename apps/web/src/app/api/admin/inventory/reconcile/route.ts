// GET /api/admin/inventory/reconcile — Inventory Anomaly Reconciliation Endpoint

import { jsonError, jsonOk } from '@/lib/http'
import { resolveReturnAuth } from '@/lib/returns-auth'

export async function GET() {
  const auth = await resolveReturnAuth()
  if (!auth) return jsonError('Silakan login terlebih dahulu', 401)
  if (!auth.isAdmin) return jsonError('Akses ditolak', 403)

  const { data: anomalies, error } = await auth.adminDb.rpc('reconcile_inventory_anomalies')

  if (error) return jsonError('Gagal menjalankan rekonsiliasi inventaris', 500, error.message)

  const anomalyList = Array.isArray(anomalies) ? anomalies : []

  return jsonOk({
    hasAnomalies: anomalyList.length > 0,
    anomalyCount: anomalyList.length,
    anomalies: anomalyList,
  })
}
