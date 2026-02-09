import { User, UpdateUserRequest, UpdatePasswordRequest } from '@/actions/user'
import { fetchApi } from '@/utils/fetchApi'

export class UserService {
  /**
   * Update user profile by email
   * @param userEmail - User's email address
   * @param body - Update data (firstName, lastName, etc.)
   * @returns Updated user data
   */
  static async updateUser(userEmail: string, body: UpdateUserRequest): Promise<User> {
    const endpoint = `/users/email/${encodeURIComponent(userEmail)}`
    const method = 'PATCH'
    
    const response = await fetchApi<User>({ 
      endpoint, 
      body, 
      method 
    })

    if (response.error) {
      throw new Error(`${response?.message || 'Unknown error occurred while updating user'}`)
    }

    return response.data!
  }

  /**
   * Update user password using Auth0
   * @param body - Password update data
   * @returns Success response
   */
  static async updatePassword(body: UpdatePasswordRequest): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update password')
      }

      const result = await response.json()
      return result
    } catch (error) {
      throw new Error(`${error instanceof Error ? error.message : 'Unknown error occurred while updating password'}`)
    }
  }

  /**
   * Get user by email
   * @param userEmail - User's email address
   * @returns User data
   */
  static async getUserByEmail(userEmail: string): Promise<User> {
    const endpoint = `/users/email/${encodeURIComponent(userEmail)}`
    const method = 'GET'
    
    const response = await fetchApi<User>({ 
      endpoint, 
      method 
    })

    if (response.error) {
      throw new Error(`${response?.message || 'Unknown error occurred while fetching user'}`)
    }

    return response.data!
  }
}
