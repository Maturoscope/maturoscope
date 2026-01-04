"use client"

import { useEffect } from "react"

/**
 * Global error handler for Server Action errors
 * This component monitors for "Failed to find Server Action" errors and 403 errors
 * and automatically reloads the page to prevent the server from entering an inconsistent state
 */
const ServerActionErrorHandler = () => {
  useEffect(() => {
    // Check if there was a previous Server Action failure on mount
    const previousFailure = sessionStorage.getItem('server-action-failed')
    if (previousFailure === 'true') {
      console.warn("Previous Server Action failure detected - clearing flag")
      sessionStorage.removeItem('server-action-failed')
    }

    // Global error handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason
      const errorMessage = error?.message || String(error) || ''

      // Check if it's a Server Action error
      if (
        errorMessage.includes("Failed to find Server Action") ||
        errorMessage.includes("Server Action returned undefined") ||
        errorMessage.includes("server action")
      ) {
        console.error("CRITICAL: Unhandled Server Action error detected - reloading page immediately")
        event.preventDefault() // Prevent default error handling
        sessionStorage.setItem('server-action-failed', 'true')
        window.location.reload()
      }

      // Check if it's a 403 error
      if (errorMessage.includes("403") || errorMessage.includes("Forbidden")) {
        console.error("CRITICAL: Unhandled 403 error detected - reloading page immediately")
        event.preventDefault() // Prevent default error handling
        sessionStorage.setItem('server-action-failed', 'true')
        window.location.reload()
      }
    }

    // Global error handler for general errors
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message || String(event.error) || ''

      // Check if it's a Server Action error
      if (
        errorMessage.includes("Failed to find Server Action") ||
        errorMessage.includes("Server Action returned undefined") ||
        errorMessage.includes("server action")
      ) {
        console.error("CRITICAL: Server Action error in global handler - reloading page immediately")
        event.preventDefault() // Prevent default error handling
        sessionStorage.setItem('server-action-failed', 'true')
        window.location.reload()
      }

      // Check if it's a 403 error
      if (errorMessage.includes("403") || errorMessage.includes("Forbidden")) {
        console.error("CRITICAL: 403 error in global handler - reloading page immediately")
        event.preventDefault() // Prevent default error handling
        sessionStorage.setItem('server-action-failed', 'true')
        window.location.reload()
      }
    }

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [])

  return null
}

export default ServerActionErrorHandler

