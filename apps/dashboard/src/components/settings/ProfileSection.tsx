import React, { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Toast } from '@/components/ui/toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
  // Reports whether there's a pending (unsaved) avatar change, so the settings
  // page can include it in the unsaved-changes guard.
  onAvatarDirtyChange?: (dirty: boolean) => void
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
  t,
  onAvatarDirtyChange
}: ProfileSectionProps) {
  
  const { user: ctxUser, refetch } = useUserContext()
  const { updateVersion, getVersionedUrl } = useImageVersion({
    storageKey: IMAGE_VERSION_CONSTANTS.STORAGE_KEYS.AVATAR,
    eventName: IMAGE_VERSION_CONSTANTS.EVENTS.AVATAR_UPDATED,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarBusy, setAvatarBusy] = useState(false)
  const [avatarToast, setAvatarToast] = useState<string | null>(null)
  // Deferred like the organization avatar: selecting/removing only updates the
  // preview; the actual upload/delete happens on "Update profile".
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [markedForRemoval, setMarkedForRemoval] = useState(false)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)

  const initials =
    `${ctxUser?.firstName?.trim()?.charAt(0) ?? ''}${ctxUser?.lastName?.trim()?.charAt(0) ?? ''}`.toUpperCase() ||
    'U'
  const avatarDirty = !!pendingFile || markedForRemoval
  const displayAvatarUrl = previewUrl
    ? previewUrl
    : markedForRemoval
      ? null
      : ctxUser?.avatar
        ? getVersionedUrl(ctxUser.avatar)
        : null

  const clearPendingAvatar = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setPendingFile(null)
    setMarkedForRemoval(false)
  }

  // Report the pending avatar change up so the unsaved-changes guard covers it,
  // and clear it when the section unmounts (navigating away / switching tab).
  useEffect(() => {
    onAvatarDirtyChange?.(avatarDirty)
  }, [avatarDirty, onAvatarDirtyChange])
  useEffect(() => () => onAvatarDirtyChange?.(false), [onAvatarDirtyChange])

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPendingFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setMarkedForRemoval(false)
  }

  const handleRemoveAvatar = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setPendingFile(null)
    setMarkedForRemoval(true)
    setShowRemoveDialog(false)
  }

  // Flush the pending avatar change (if any), then persist the profile fields.
  // The avatar is personal, so it can be saved even when the name fields are
  // locked (first admin member); names are only persisted when they changed.
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const removing = markedForRemoval && !pendingFile
    if (avatarDirty) {
      setAvatarBusy(true)
      try {
        if (pendingFile) {
          const body = new FormData()
          body.append('file', pendingFile)
          const res = await fetch('/api/users/avatar', { method: 'PATCH', body, credentials: 'include' })
          if (!res.ok) throw new Error()
        } else if (markedForRemoval) {
          const res = await fetch('/api/users/avatar', { method: 'DELETE', credentials: 'include' })
          if (!res.ok) throw new Error()
        }
        await refetch()
        updateVersion()
        clearPendingAvatar()
      } catch {
        setAvatarBusy(false)
        setAvatarToast(t('PROFILE.AVATAR.ERROR'))
        return
      }
      setAvatarBusy(false)
    }

    if (hasChanges && !isFirstAdminMember) {
      onSubmit(e)
    } else if (avatarDirty) {
      // Avatar-only save: surface its own confirmation toast.
      setAvatarToast(removing ? t('PROFILE.AVATAR.REMOVED') : t('PROFILE.AVATAR.UPDATED'))
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
      
      <form onSubmit={handleFormSubmit} className="space-y-4">
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
                {displayAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={displayAvatarUrl} alt={initials} className="w-full h-full object-cover" />
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
                {t('PROFILE.AVATAR.UPLOAD')}
              </Button>
            </div>

            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setShowRemoveDialog(true)}
              disabled={avatarBusy || (!ctxUser?.avatar && !pendingFile)}
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
          disabled={
            isUpdating ||
            avatarBusy ||
            Object.keys(errors).length > 0 ||
            // Enable on a personal avatar change (always), or on name changes
            // when the user is allowed to edit them.
            !(avatarDirty || (hasChanges && !isFirstAdminMember))
          }
        >
          {isUpdating || avatarBusy ? <Loader2 className="size-4 animate-spin" /> : t('PROFILE.UPDATE_PROFILE')}
        </Button>
      </form>

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('PROFILE.AVATAR.REMOVE_DIALOG.TITLE')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('PROFILE.AVATAR.REMOVE_DIALOG.MESSAGE')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogAction
              onClick={handleRemoveAvatar}
              className="mt-2 sm:mt-0 bg-white border border-gray-200 text-red-600 shadow-none hover:bg-red-50 hover:text-red-700"
            >
              {t('PROFILE.AVATAR.REMOVE_DIALOG.CONFIRM')}
            </AlertDialogAction>
            <AlertDialogCancel className="mt-0 border-0 bg-gray-900 text-white hover:bg-gray-800 hover:text-white">
              {t('PROFILE.AVATAR.REMOVE_DIALOG.CANCEL')}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toast
        title={avatarToast ?? ''}
        isVisible={!!avatarToast}
        onClose={() => setAvatarToast(null)}
      />
    </div>
  )
}
