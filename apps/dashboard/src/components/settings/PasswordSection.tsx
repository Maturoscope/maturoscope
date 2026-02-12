import React from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { PasswordFormData } from './useSettingsState'
import { validateField } from './validations'

interface PasswordSectionProps {
  form: PasswordFormData
  setForm: React.Dispatch<React.SetStateAction<PasswordFormData>>
  errors: {[key: string]: string}
  setErrors: React.Dispatch<React.SetStateAction<{[key: string]: string}>>
  isUpdating: boolean
  hasChanges: boolean
  onSubmit: (e: React.FormEvent) => void
  t: (key: string) => string
}

export function PasswordSection({
  form,
  setForm,
  errors,
  setErrors,
  isUpdating,
  hasChanges,
  onSubmit,
  t
}: PasswordSectionProps) {
  
  // Check if all password requirements are met
  const isPasswordFormValid = () => {
    return (
      form.currentPassword.trim() !== '' &&
      form.newPassword.trim() !== '' &&
      form.confirmPassword.trim() !== '' &&
      form.newPassword.length >= 10 &&
      /[a-zA-Z]/.test(form.newPassword) &&
      /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(form.newPassword) &&
      form.newPassword === form.confirmPassword &&
      Object.keys(errors).length === 0
    )
  }
  
  const handleFieldChange = (fieldName: keyof PasswordFormData, value: string) => {
    setForm(prev => ({ ...prev, [fieldName]: value }))
    
    // Real-time validation
    const fieldErrors = validateField(fieldName, value, form, t)
    setErrors(prev => {
      const newErrors = { ...prev }
      
      // Apply new errors
      Object.assign(newErrors, fieldErrors)
      
      // Remove specific field error if it's now valid and not in fieldErrors
      if (!fieldErrors[fieldName]) {
        delete newErrors[fieldName]
      }
      
      return newErrors
    })
  }

  // Prevent copy and paste on confirm password field
  const handleConfirmPasswordPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
  }

  const handleConfirmPasswordCopy = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
  }

  const handleConfirmPasswordContextMenu = (e: React.MouseEvent<HTMLInputElement>) => {
    e.preventDefault()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{t('PASSWORD.TITLE')}</h2>
      </div>

      <Separator />
      
      <form onSubmit={onSubmit} className="space-y-4">
        {errors.general && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {errors.general}
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="currentPassword">{t('PASSWORD.CURRENT_PASSWORD')} *</Label>
          <div className="max-w-[400px]">
            <PasswordInput
              id="currentPassword"
              value={form.currentPassword}
              onChange={(e) => handleFieldChange('currentPassword', e.target.value)}
              className={errors.currentPassword ? "border-red-500" : ""}
              disabled={isUpdating}
              placeholder="Current password"
              required
            />
          </div>
          {errors.currentPassword && (
            <p className="text-sm text-red-600">{errors.currentPassword}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="newPassword">{t('PASSWORD.NEW_PASSWORD')} *</Label>
          <div className="max-w-[400px]">
            <PasswordInput
              id="newPassword"
              value={form.newPassword}
              onChange={(e) => handleFieldChange('newPassword', e.target.value)}
              className={errors.newPassword ? "border-red-500" : ""}
              disabled={isUpdating}
              placeholder="New password"
              required
            />
          </div>
          {errors.newPassword && (
            <p className="text-sm text-red-600">{errors.newPassword}</p>
          )}
        </div>
        
        {/* Password Requirements */}
        <div className="text-sm text-gray-600">
          <p className="font-medium mb-2">{t('PASSWORD.REQUIREMENTS')}</p>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Checkbox 
                checked={form.newPassword.length >= 10}
                className="h-4 w-4 border-gray-600 data-[state=checked]:bg-black data-[state=checked]:border-black"
              />
              <span className="text-gray-900 font-medium">
                {t('PASSWORD.MIN_CHARACTERS')}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                checked={/[A-Z]/.test(form.newPassword)}
                className="h-4 w-4 border-gray-600 data-[state=checked]:bg-black data-[state=checked]:border-black"
              />
              <span className="text-gray-900 font-medium">
                {t('PASSWORD.ONE_UPPERCASE')}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                checked={/[a-z]/.test(form.newPassword)}
                className="h-4 w-4 border-gray-600 data-[state=checked]:bg-black data-[state=checked]:border-black"
              />
              <span className="text-gray-900 font-medium">
                {t('PASSWORD.ONE_LOWERCASE')}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                checked={/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(form.newPassword)} 
                className="h-4 w-4 border-gray-600 data-[state=checked]:bg-black data-[state=checked]:border-black"
              />
              <span className="text-gray-900 font-medium">
                {t('PASSWORD.ONE_NUMBER_SPECIAL')}
              </span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t('PASSWORD.CONFIRM_PASSWORD')} *</Label>
          <div className="max-w-[400px]">
            <PasswordInput
              id="confirmPassword"
              value={form.confirmPassword}
              onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
              onPaste={handleConfirmPasswordPaste}
              onCopy={handleConfirmPasswordCopy}
              onContextMenu={handleConfirmPasswordContextMenu}
              className={errors.confirmPassword ? "border-red-500" : ""}
              disabled={isUpdating}
              placeholder="Confirm new password"
              required
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>
        
        <Button 
          type="submit" 
          className="w-full sm:w-auto sm:min-w-[150px]" 
          disabled={isUpdating || !hasChanges || !isPasswordFormValid()}
        >
          {isUpdating ? <Loader2 className="size-4 animate-spin" /> : t('PASSWORD.UPDATE_PASSWORD')}
        </Button>
      </form>
    </div>
  )
}
