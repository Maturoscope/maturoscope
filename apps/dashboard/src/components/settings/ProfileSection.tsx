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
        
        <div className="space-y-2">
          <Label>{t('PROFILE.AVATAR.LABEL')}</Label>
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={initials}
                className="h-10 w-10 rounded-full object-cover shrink-0"
              />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                {initials}
              </span>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarBusy}
            >
              {avatarBusy ? <Loader2 className="size-4 animate-spin" /> : t('PROFILE.AVATAR.UPLOAD')}
            </Button>
            <Button
              type="button"
              onClick={handleRemoveAvatar}
              disabled={avatarBusy || !ctxUser?.avatar}
              className="ml-auto bg-red-600 hover:bg-red-700 text-white"
            >
              {t('PROFILE.AVATAR.REMOVE')}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              className="hidden"
              onChange={handleAvatarFile}
            />
          </div>
          <p className="text-sm text-gray-500">{t('PROFILE.AVATAR.HELPER')}</p>
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
