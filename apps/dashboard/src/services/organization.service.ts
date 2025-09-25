import { fetchApi } from '@/utils/fetchApi'

export interface Organization {
  id: string
  key: string
  name: string
  email: string
  font?: string
  theme?: string
  signature?: string
  language?: string
  avatar?: string
  status: string
  createdAt: string
}

export interface UpdateOrganizationRequest {
  name?: string
  email?: string
  font?: string
  theme?: string
  signature?: string
  language?: string
}

export class OrganizationService {
  /**
   * Update organization profile
   * @param organizationId - Organization's ID
   * @param body - Update data (name, font, theme, etc.)
   * @returns Updated organization data
   */
  static async updateOrganization(organizationId: string, body: UpdateOrganizationRequest): Promise<Organization> {
    const endpoint = `/organizations/${encodeURIComponent(organizationId)}`
    const method = 'PATCH'
    
    const response = await fetchApi<Organization>({ 
      endpoint, 
      body, 
      method 
    })

    if (response.error) {
      throw new Error(`${response?.message || 'Unknown error occurred while updating organization'}`)
    }

    return response.data!
  }

  /**
   * Remove organization avatar (set to null)
   * @returns Updated organization data with null avatar
   */
  static async removeAvatar(): Promise<{ avatar: null }> {
    try {
      const response = await fetch('/api/organizations/avatar', {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      throw new Error(`${error instanceof Error ? error.message : 'Unknown error occurred while removing avatar'}`)
    }
  }

  // PDF Signature methods
  static async uploadSignature(file: File): Promise<{ signature: string }> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/organizations/signature', {
        method: 'PATCH',
        body: formData,
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      throw new Error(`${error instanceof Error ? error.message : 'Unknown error occurred while uploading signature'}`)
    }
  }

  static async removeSignature(): Promise<{ signature: null }> {
    try {
      const response = await fetch('/api/organizations/signature', {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      throw new Error(`${error instanceof Error ? error.message : 'Unknown error occurred while removing signature'}`)
    }
  }

  // Profile update method (using current user's organization)
  static async updateProfile(data: { name: string; key: string; email: string }): Promise<Organization> {
    try {
      const response = await fetch('/api/organizations/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      throw new Error(`${error instanceof Error ? error.message : 'Unknown error occurred while updating profile'}`)
    }
  }

  // Language method  
  static async updateLanguage(language: string): Promise<{ language: string }> {
    try {
      const response = await fetch('/api/organizations/language', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language }),
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      throw new Error(`${error instanceof Error ? error.message : 'Unknown error occurred while updating language'}`)
    }
  }

  /**
   * Upload organization avatar
   * @param file - Avatar file to upload
   * @returns Updated organization data with new avatar URL
   */
  static async uploadAvatar(file: File): Promise<{ avatar: string }> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/organizations/avatar', {
        method: 'PATCH',
        body: formData,
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      throw new Error(`${error instanceof Error ? error.message : 'Unknown error occurred while uploading avatar'}`)
    }
  }

  /**
   * Get organization by ID
   * @param organizationId - Organization's ID
   * @returns Organization data
   */
  static async getOrganizationById(organizationId: string): Promise<Organization> {
    const endpoint = `/organizations/${encodeURIComponent(organizationId)}`
    const method = 'GET'
    
    const response = await fetchApi<Organization>({ 
      endpoint, 
      method 
    })

    if (response.error) {
      throw new Error(`${response?.message || 'Unknown error occurred while fetching organization'}`)
    }

    return response.data!
  }

  /**
   * Update organization settings (customization)
   * @param organizationId - Organization's ID
   * @param settings - Settings to update (font, theme, signature, language)
   * @returns Updated organization data
   */
  static async updateSettings(organizationId: string, settings: {
    font?: string
    theme?: string
    signature?: string
    language?: string
  }): Promise<Organization> {
    const endpoint = `/organizations/${encodeURIComponent(organizationId)}`
    const method = 'PATCH'
    
    const response = await fetchApi<Organization>({ 
      endpoint, 
      body: settings, 
      method 
    })

    if (response.error) {
      throw new Error(`${response?.message || 'Unknown error occurred while updating organization settings'}`)
    }

    return response.data!
  }
}
