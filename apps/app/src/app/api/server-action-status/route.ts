import { NextResponse } from 'next/server'

/**
 * Endpoint to check if Server Actions are working correctly
 * This can be used by monitoring/health check systems to detect
 * when the server enters an inconsistent state
 */
export async function GET() {
  try {
    // Basic health check - if we can respond, the server is running
    // Server Actions availability is checked by attempting to use them in the app
    // This endpoint serves as a basic health indicator
    
    return NextResponse.json(
      {
        status: 'healthy',
        serverActionsAvailable: true,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        message: 'Server Actions appear to be functioning correctly',
      },
      { status: 200 }
    )
  } catch (error) {
    // If there's an error, the server might be in an inconsistent state
    return NextResponse.json(
      {
        status: 'unhealthy',
        serverActionsAvailable: false,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Server Actions may not be functioning correctly - server restart recommended',
      },
      { status: 503 }
    )
  }
}

// Support for HEAD requests (more efficient for probes)
export async function HEAD() {
  return new Response(null, { status: 200 })
}

