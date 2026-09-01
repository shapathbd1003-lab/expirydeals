import { NextResponse } from 'next/server'

export function ok(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function paginated(data: unknown[], pagination: {
  page: number; perPage: number; total: number
}) {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      page: pagination.page,
      perPage: pagination.perPage,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.perPage),
    },
  })
}

export function err(code: string, message: string, status: number, details?: unknown) {
  return NextResponse.json(
    { success: false, error: { code, message, ...(details ? { details } : {}) } },
    { status }
  )
}

export const unauthorized = () => err('UNAUTHORIZED', 'Authentication required', 401)
export const forbidden = () => err('FORBIDDEN', 'Insufficient permissions', 403)
export const notFound = (msg = 'Not found') => err('NOT_FOUND', msg, 404)
export const conflict = (msg: string) => err('CONFLICT', msg, 409)
export const validationError = (msg: string, details?: unknown) =>
  err('VALIDATION_ERROR', msg, 400, details)
export const serverError = () => err('INTERNAL_ERROR', 'An unexpected error occurred', 500)
