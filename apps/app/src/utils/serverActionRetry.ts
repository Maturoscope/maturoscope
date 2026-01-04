/**
 * Wrapper utility to retry Server Actions that fail with "Failed to find Server Action" error
 * This is a workaround for Next.js 15 hot reload issues with Server Actions
 */

export async function withServerActionRetry<T>(
  action: () => Promise<T>,
  maxRetries: number = 2,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await action()
      
      // Validate result is not undefined (can happen if Server Action fails silently)
      if (result === undefined) {
        throw new Error("Server Action returned undefined - action may have failed")
      }
      
      return result
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Check if it's a Server Action error
      const isServerActionError =
        lastError.message.includes("Failed to find Server Action") ||
        lastError.message.includes("server action") ||
        lastError.message.includes("Server Action returned undefined")

      if (isServerActionError) {
        // CRITICAL: If we detect "Failed to find Server Action", reload immediately
        // This prevents the server from entering an inconsistent state that causes 403 errors
        if (typeof window !== 'undefined') {
          console.error(
            `CRITICAL: Server Action error detected - reloading page immediately to prevent 403 cascade`,
            lastError.message
          )
          // Store flag and reload immediately - don't wait for retries
          sessionStorage.setItem('server-action-failed', 'true')
          // Reload immediately to prevent server from entering inconsistent state
          window.location.reload()
          // This will never execute, but TypeScript needs it
          throw lastError
        }
        
        // If it's the last attempt and we're on server, throw the error
        if (attempt === maxRetries) {
          console.warn(
            `Server Action error after ${attempt + 1} attempts:`,
            lastError.message
          )
          throw lastError
        }

        // Wait before retrying with exponential backoff
        // Add a longer delay to allow server to recover
        const waitTime = delay * (attempt + 1) * 2 // Double the delay
        console.log(
          `Server Action error (attempt ${attempt + 1}/${maxRetries}), retrying in ${waitTime}ms...`
        )
        await new Promise((resolve) => setTimeout(resolve, waitTime))
        continue
      }

      // For other errors, throw immediately
      throw lastError
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new Error("Unknown error in server action retry")
}

