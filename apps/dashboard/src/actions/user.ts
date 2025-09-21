export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  picture?: string
  roles?: string[]
  organization?: {
    id: string
    name: string
    avatar?: string
  }
  termsAccepted?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface UpdateUserRequest {
  firstName?: string
  lastName?: string
  picture?: string
}

export interface UpdatePasswordRequest {
  currentPassword: string
  newPassword: string
}
