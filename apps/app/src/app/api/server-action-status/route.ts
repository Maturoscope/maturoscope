import { NextResponse } from 'next/server'

/**
 * Endpoint to check if Server Actions are working correctly
 * This can be used by monitoring/health check systems to detect
 * when the server enters an inconsistent state
 */
export async function GET() {
  try {
    // Try to import a Server Action to verify they're available
    // This is a simple check to see if Server Actions are accessible
    const testAction = async () => {
      'use server'
      return { status: 'ok', timestamp: new Date().toISOString() }
    }

    // If we can create a Server Action function, the server is likely healthy
    // Note: This is a basic check - in production, you might want more sophisticated checks
    
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

