import { ProfileFormData, PasswordFormData } from './useSettingsState'

export interface ValidationResult {
  isValid: boolean
  errors: {[key: string]: string}
}

export function validateProfileForm(
  form: ProfileFormData, 
  t: (key: string) => string
): ValidationResult {
  const errors: {[key: string]: string} = {}
  
  if (!form.firstName.trim()) {
    errors.firstName = t('ERRORS.FIELD_REQUIRED')
  }
  
  if (!form.lastName.trim()) {
    errors.lastName = t('ERRORS.FIELD_REQUIRED')
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export function validatePasswordForm(
  form: PasswordFormData, 
  t: (key: string) => string
): ValidationResult {
  const errors: {[key: string]: string} = {}
  
  if (!form.currentPassword.trim()) {
    errors.currentPassword = t('ERRORS.FIELD_REQUIRED')
  }
  
  if (!form.newPassword.trim()) {
    errors.newPassword = t('ERRORS.FIELD_REQUIRED')
  } else {
    // Check password requirements
    if (form.newPassword.length < 10) {
      errors.newPassword = t('ERRORS.PASSWORD_TOO_SHORT')
    } else if (!/[a-zA-Z]/.test(form.newPassword)) {
      errors.newPassword = t('ERRORS.PASSWORD_NO_LETTER')
    } else if (!/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(form.newPassword)) {
      errors.newPassword = t('ERRORS.PASSWORD_NO_NUMBER_SPECIAL')
    }
  }
  
  if (!form.confirmPassword.trim()) {
    errors.confirmPassword = t('ERRORS.FIELD_REQUIRED')
  } else if (form.newPassword !== form.confirmPassword) {
    errors.confirmPassword = t('ERRORS.PASSWORDS_DONT_MATCH')
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export function validateField(
  fieldName: string, 
  value: string, 
  form: PasswordFormData | { currentPassword: string; newPassword: string; confirmPassword: string },
  t: (key: string) => string
): {[key: string]: string} {
  const errors: {[key: string]: string} = {}
  
  if (fieldName === 'firstName' || fieldName === 'lastName') {
    if (!value.trim()) {
      errors[fieldName] = t('ERRORS.FIELD_REQUIRED')
    }
  } else if (fieldName === 'currentPassword') {
    if (!value.trim()) {
      errors[fieldName] = t('ERRORS.FIELD_REQUIRED')
    }
  } else if (fieldName === 'newPassword') {
    if (!value.trim()) {
      errors[fieldName] = t('ERRORS.FIELD_REQUIRED')
    } else if (value.length < 10) {
      errors[fieldName] = t('ERRORS.PASSWORD_TOO_SHORT')
    } else if (!/[a-zA-Z]/.test(value)) {
      errors[fieldName] = t('ERRORS.PASSWORD_NO_LETTER')
    } else if (!/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) {
      errors[fieldName] = t('ERRORS.PASSWORD_NO_NUMBER_SPECIAL')
    } else {
      if (form.confirmPassword) {
        if (value !== form.confirmPassword) {
          errors.confirmPassword = t('ERRORS.PASSWORDS_DONT_MATCH')
        }
      }
    }
  } else if (fieldName === 'confirmPassword') {
    if (!value.trim()) {
      errors[fieldName] = t('ERRORS.FIELD_REQUIRED')
    } else if (form.newPassword !== value) {
      errors[fieldName] = t('ERRORS.PASSWORDS_DONT_MATCH')
    }
  }
  
  return errors
}
