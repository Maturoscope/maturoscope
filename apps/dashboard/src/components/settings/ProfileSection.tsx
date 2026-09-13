import React, { useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Toast } from '@/components/ui/toast'
import { ProfileFormData } from './useSettingsState'
import { validateField } from './validations'
import { useUserContext } from '@/app/hooks/contexts/UserProvider'
import { useImageVersion } from '@/hooks/useImageVersion'
import { IMAGE_VERSION_CONSTANTS, FILE_VALIDATION } from '@/constants/imageVersion'

interface User {
  email?: string
  organization?: {
    name?: string
    email?: string
  }
}

interface ProfileSectionProps {
  form: ProfileFormData
  setForm: React.Dispatch<React.SetStateAction<ProfileFormData>>
  user: User | null
  errors: {[key: string]: string}
  setErrors: React.Dispatch<React.SetStateAction<{[key: string]: string}>>
  isUpdating: boolean
  hasChanges: boolean
  onSubmit: (e: React.FormEvent) => void
  t: (key: string) => string
}

export function ProfileSection({
  form,
  setForm,
  user,
  errors,
  setErrors,
  isUpdating,
  hasChanges,
  onSubmit,
  t
}: ProfileSectionProps) {
  
  const { user: ctxUser, refetch } = useUserContext()
  const { updateVersion, getVersionedUrl } = useImageVersion({
    storageKey: IMAGE_VERSION_CONSTANTS.STORAGE_KEYS.AVATAR,
    eventName: IMAGE_VERSION_CONSTANTS.EVENTS.AVATAR_UPDATED,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarBusy, setAvatarBusy] = useState(false)
  const [avatarToast, setAvatarToast] = useState<string | null>(null)

  const initials =
    `${ctxUser?.firstName?.trim()?.charAt(0) ?? ''}${ctxUser?.lastName?.trim()?.charAt(0) ?? ''}`.toUpperCase() ||
    'U'
  const avatarUrl = ctxUser?.avatar ? getVersionedUrl(ctxUser.avatar) : null

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!FILE_VALIDATION.AVATAR.ACCEPTED_TYPES.includes(file.type as never)) {
      setAvatarToast(t('PROFILE.AVATAR.INVALID_TYPE'))
      return
    }
    if (file.size > FILE_VALIDATION.AVATAR.MAX_SIZE) {
      setAvatarToast(t('PROFILE.AVATAR.TOO_LARGE'))
      return
    }

    setAvatarBusy(true)
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch('/api/users/avatar', { method: 'PATCH', body, credentials: 'include' })
      if (!res.ok) throw new Error()
      await refetch()
      updateVersion()
      setAvatarToast(t('PROFILE.AVATAR.UPDATED'))
    } catch {
      setAvatarToast(t('PROFILE.AVATAR.ERROR'))
    } finally {
      setAvatarBusy(false)
    }
  }

  const handleRemoveAvatar = async () => {
    setAvatarBusy(true)
    try {
      const res = await fetch('/api/users/avatar', { method: 'DELETE', credentials: 'include' })
      if (!res.ok) throw new Error()
      await refetch()
      updateVersion()
      setAvatarToast(t('PROFILE.AVATAR.REMOVED'))
    } catch {
      setAvatarToast(t('PROFILE.AVATAR.ERROR'))
    } finally {
      setAvatarBusy(false)
    }
  }

  // Check if user is the first admin member (email matches organization email)
  const isFirstAdminMember = Boolean(
    user?.email && 
    user?.organization?.email && 
    user.email.toLowerCase() === user.organization.email.toLowerCase()
  )

  const handleFieldChange = (fieldName: keyof ProfileFormData, value: string) => {
    // Prevent changes if user is the first admin member
    if (isFirstAdminMember) {
      return
    }
    
    setForm(prev => ({ ...prev, [fieldName]: value }))
    
    // Real-time validation
    const fieldErrors = validateField(fieldName, value, { currentPassword: '', newPassword: '', confirmPassword: '' }, t)
    setErrors(prev => {
      const newErrors = { ...prev, ...fieldErrors }
      // Remove error if field is now valid
      if (Object.keys(fieldErrors).length === 0 && newErrors[fieldName]) {
        delete newErrors[fieldName]
      }
      return newErrors
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{t('PROFILE.TITLE')}</h2>
      </div>
      
      <Separator />
      
      <form onSubmit={onSubmit} className="space-y-4">
        {errors.general && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {errors.general}
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">{t('PROFILE.FIRST_NAME')} *</Label>
            <Input
              id="firstName"
              type="text"
              value={form.firstName}
              onChange={(e) => handleFieldChange('firstName', e.target.value)}
              className={errors.firstName ? "border-red-500" : (isUpdating || isFirstAdminMember) ? "bg-muted" : ""}
              disabled={isUpdating || isFirstAdminMember}
              required
            />
            {errors.firstName && (
              <p className="text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastName">{t('PROFILE.LAST_NAME')} *</Label>
            <Input
              id="lastName"
              type="text"
              value={form.lastName}
              onChange={(e) => handleFieldChange('lastName', e.target.value)}
              className={errors.lastName ? "border-red-500" : (isUpdating || isFirstAdminMember) ? "bg-muted" : ""}
              disabled={isUpdating || isFirstAdminMember}
              required
            />
            {errors.lastName && (
              <p className="text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-700">
            {t('PROFILE.AVATAR.LABEL')}
          </label>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative w-16 h-16 rounded-full border-2 border-gray-200 overflow-hidden">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt={initials} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-lg font-medium text-gray-600">{initials}</span>
                  </div>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarBusy}
              >
                {avatarBusy ? <Loader2 className="size-4 animate-spin" /> : t('PROFILE.AVATAR.UPLOAD')}
              </Button>
            </div>

            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemoveAvatar}
              disabled={avatarBusy || !ctxUser?.avatar}
            >
              {t('PROFILE.AVATAR.REMOVE')}
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".svg,.png,.jpg,.jpeg"
              className="hidden"
              onChange={handleAvatarFile}
            />
          </div>

          <p className="text-xs text-gray-900 font-medium">{t('PROFILE.AVATAR.HELPER')}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t('PROFILE.EMAIL')}</Label>
          <Input
            id="email"
            type="email"
            value={user?.email || ''}
            disabled
            className="bg-muted"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="organization">{t('PROFILE.ORGANIZATION')}</Label>
          <Input
            id="organization"
            type="text"
            value={user?.organization?.name || ''}
            disabled
            className="bg-muted"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full sm:w-auto sm:min-w-[150px]" 
          disabled={isUpdating || !hasChanges || Object.keys(errors).length > 0 || isFirstAdminMember}
        >
          {isUpdating ? <Loader2 className="size-4 animate-spin" /> : t('PROFILE.UPDATE_PROFILE')}
        </Button>
      </form>

      <Toast
        title={avatarToast ?? ''}
        isVisible={!!avatarToast}
        onClose={() => setAvatarToast(null)}
      />
    </div>
  )
}
