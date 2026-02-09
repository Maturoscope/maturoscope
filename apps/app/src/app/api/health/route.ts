import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // You can add additional health checks here if needed
    // For example: database connectivity, external services, etc.
    
    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    )
  }
}

// Also support HEAD requests for lighter checks
export async function HEAD() {
  return new Response(null, { status: 200 })
}
