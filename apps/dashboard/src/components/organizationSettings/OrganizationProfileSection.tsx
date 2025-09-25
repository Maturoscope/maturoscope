import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OrganizationProfileFormData } from './useOrganizationSettingsState'

interface OrganizationProfileSectionProps {
  form: OrganizationProfileFormData
  setForm: React.Dispatch<React.SetStateAction<OrganizationProfileFormData>>
  user: { email?: string } | null
  errors: { [key: string]: string }
  setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>
  isUpdating: boolean
  hasChanges: boolean
  onSave: () => Promise<void>
}

export function OrganizationProfileSection({
  form,
  setForm,
  errors,
  setErrors,
  isUpdating,
  hasChanges,
  onSave,
}: OrganizationProfileSectionProps) {
  const { t } = useTranslation('ORGANIZATION_SETTINGS')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(form.avatarUrl || null)

  const handleFieldChange = (field: keyof OrganizationProfileFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/svg+xml', 'image/png', 'image/jpeg']
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        avatar: t('PROFILE.ERRORS.INVALID_AVATAR_TYPE')
      }))
      return
    }

    // Validate file size (4MB)
    const maxSize = 4 * 1024 * 1024
    if (file.size > maxSize) {
      setErrors(prev => ({
        ...prev,
        avatar: t('PROFILE.ERRORS.AVATAR_TOO_LARGE')
      }))
      return
    }

    // Clear errors
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.avatar
      return newErrors
    })

    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    // Update form
    setForm(prev => ({
      ...prev,
      avatarFile: file,
      avatarUrl: url
    }))
  }

  const handleRemoveAvatar = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setForm(prev => ({
      ...prev,
      avatarFile: null,
      avatarUrl: ''
    }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{t('SECTIONS.PROFILE')}</h2>
      </div>

      <div className="space-y-6">
        {/* Organization Name */}
        <div className="space-y-2">
          <Label htmlFor="name">{t('PROFILE.NAME.LABEL')}</Label>
          <Input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            placeholder={t('PROFILE.NAME.PLACEHOLDER')}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Avatar Upload */}
        <div className="space-y-4">
          <Label>{t('PROFILE.AVATAR.LABEL')}</Label>
          
          <div className="flex items-center space-x-4">
            {/* Avatar Preview */}
            <button
              onClick={triggerFileInput}
              className="relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Organization avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer">
                  <span className="text-lg font-medium text-gray-600">
                    {getInitials(form.name || 'N')}
                  </span>
                </div>
              )}
            </button>

            {/* Upload Actions */}
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={triggerFileInput}
              >
                {t('PROFILE.AVATAR.UPLOAD_BUTTON')}
              </Button>
              {previewUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={handleRemoveAvatar}
                >
                  {t('PROFILE.AVATAR.REMOVE_BUTTON')}
                </Button>
              )}
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".svg,.png,.jpg,.jpeg"
            onChange={handleFileSelect}
            className="hidden"
          />

          <p className="text-xs text-gray-500">
            {t('PROFILE.AVATAR.REQUIREMENTS')}
          </p>

          {errors.avatar && (
            <p className="text-sm text-red-600">{errors.avatar}</p>
          )}
        </div>

        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="username">{t('PROFILE.USERNAME.LABEL')}</Label>
          <Input
            id="username"
            type="text"
            value={form.username}
            onChange={(e) => handleFieldChange('username', e.target.value)}
            placeholder={t('PROFILE.USERNAME.PLACEHOLDER')}
            className={errors.username ? 'border-red-500' : ''}
          />
          {errors.username && (
            <p className="text-sm text-red-600">{errors.username}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">{t('PROFILE.EMAIL.LABEL')}</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            placeholder={t('PROFILE.EMAIL.PLACEHOLDER')}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* General Error Message */}
        {errors.general && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={onSave}
            disabled={!hasChanges || isUpdating}
            className="px-6"
          >
            {isUpdating ? t('PROFILE.SAVING') : t('PROFILE.UPDATE_BUTTON')}
          </Button>
        </div>
      </div>
    </div>
  )
}
