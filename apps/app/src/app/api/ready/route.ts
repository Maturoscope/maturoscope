import { NextResponse } from 'next/server'

// Simple endpoint for readiness probe
export async function GET() {
  // This endpoint simply verifies that the application is ready to receive traffic
  return NextResponse.json({ status: 'ready' }, { status: 200 })
}

// Support for HEAD requests (more efficient for probes)
export async function HEAD() {
  return new Response(null, { status: 200 })
}
