import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
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
import { useUserContext } from '@/app/hooks/contexts/UserProvider'

interface OrganizationSummary {
  id: string
  key?: string
  name: string
  avatar?: string | null
  isDefault: boolean
  invitedAt?: string | null
  joinedAt?: string | null
}

interface MembershipsResponse {
  active: OrganizationSummary[]
  pending: OrganizationSummary[]
}

type PendingDialog =
  | { type: 'leave'; org: OrganizationSummary }
  | { type: 'setDefault'; org: OrganizationSummary }
  | { type: 'decline'; org: OrganizationSummary }
  | null

/** Circular organization avatar: image when available, initial otherwise. */
function OrgAvatar({ org }: { org: OrganizationSummary }) {
  if (org.avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={org.avatar}
        alt={org.name}
        className="w-10 h-10 rounded-full object-cover shrink-0"
      />
    )
  }
  return (
    <span className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-semibold shrink-0">
      {org.name?.slice(0, 1).toUpperCase()}
    </span>
  )
}

/** Localized "x days ago" style relative time for the invitation date. */
function useRelativeTime() {
  const { i18n } = useTranslation()
  const locale = i18n.language?.startsWith('fr') ? 'fr' : 'en'
  return useCallback(
    (iso?: string | null) => {
      if (!iso) return ''
      const then = new Date(iso).getTime()
      if (Number.isNaN(then)) return ''
      const diffMs = then - Date.now()
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
      const minutes = Math.round(diffMs / 60000)
      const hours = Math.round(diffMs / 3600000)
      const days = Math.round(diffMs / 86400000)
      if (Math.abs(days) >= 1) return rtf.format(days, 'day')
      if (Math.abs(hours) >= 1) return rtf.format(hours, 'hour')
      return rtf.format(minutes, 'minute')
    },
    [locale],
  )
}

export function OrganizationsSection() {
  const { t } = useTranslation('USER_SETTINGS')
  const { refetch } = useUserContext()
  const relativeTime = useRelativeTime()

  const [data, setData] = useState<MembershipsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [dialog, setDialog] = useState<PendingDialog>(null)
  const [toast, setToast] = useState<{ title: string } | null>(null)

  const load = useCallback(async () => {
    try {
      setLoadError(false)
      const res = await fetch('/api/organizations/memberships', { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to load memberships')
      setData(await res.json())
    } catch {
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const showToast = (title: string) => setToast({ title })

  const setDefault = async (org: OrganizationSummary) => {
    setBusyId(org.id)
    try {
      const res = await fetch('/api/organizations/memberships', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ organizationId: org.id }),
      })
      if (!res.ok) throw new Error()
      await load()
      showToast(t('ORGANIZATIONS.TOASTS.DEFAULT_UPDATED'))
    } catch {
      showToast(t('ORGANIZATIONS.TOASTS.ERROR'))
    } finally {
      setBusyId(null)
    }
  }

  const membershipAction = async (
    org: OrganizationSummary,
    action: 'leave' | 'accept' | 'decline',
    successKey: string,
  ) => {
    setBusyId(org.id)
    try {
      const res = await fetch(`/api/organizations/memberships/${org.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error()
      await load()
      await refetch()
      showToast(t(successKey))
    } catch {
      showToast(t('ORGANIZATIONS.TOASTS.ERROR'))
    } finally {
      setBusyId(null)
    }
  }

  const confirmDialog = async () => {
    if (!dialog) return
    const { type, org } = dialog
    setDialog(null)
    if (type === 'leave') await membershipAction(org, 'leave', 'ORGANIZATIONS.TOASTS.LEFT')
    else if (type === 'decline') await membershipAction(org, 'decline', 'ORGANIZATIONS.TOASTS.DECLINED')
    else if (type === 'setDefault') await setDefault(org)
  }

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[72px] bg-gray-100 rounded-lg" />
        ))}
      </div>
    )
  }

  const active = data?.active ?? []
  const pending = data?.pending ?? []

  const dialogCopy = dialog
    ? {
        leave: {
          title: t('ORGANIZATIONS.LEAVE_DIALOG.TITLE', { name: dialog.org.name }),
          message: t('ORGANIZATIONS.LEAVE_DIALOG.MESSAGE'),
          confirm: t('ORGANIZATIONS.LEAVE_DIALOG.CONFIRM'),
          cancel: t('ORGANIZATIONS.LEAVE_DIALOG.CANCEL'),
        },
        setDefault: {
          title: t('ORGANIZATIONS.SET_DEFAULT_DIALOG.TITLE', { name: dialog.org.name }),
          message: t('ORGANIZATIONS.SET_DEFAULT_DIALOG.MESSAGE'),
          confirm: t('ORGANIZATIONS.SET_DEFAULT_DIALOG.CONFIRM'),
          cancel: t('ORGANIZATIONS.SET_DEFAULT_DIALOG.CANCEL'),
        },
        decline: {
          title: t('ORGANIZATIONS.DECLINE_DIALOG.TITLE'),
          message: t('ORGANIZATIONS.DECLINE_DIALOG.MESSAGE'),
          confirm: t('ORGANIZATIONS.DECLINE_DIALOG.CONFIRM'),
          cancel: t('ORGANIZATIONS.DECLINE_DIALOG.CANCEL'),
        },
      }[dialog.type]
    : null

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-900">{t('ORGANIZATIONS.TITLE')}</h2>
      <div className="mt-5 border-t border-gray-200" />

      {/* Active organizations */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-900">
          {t('ORGANIZATIONS.YOUR_ORGANIZATIONS')}
        </h3>
        <p className="mt-1 text-sm text-gray-500">{t('ORGANIZATIONS.DESCRIPTION')}</p>

        {loadError ? (
          <p className="mt-4 text-sm text-red-600">{t('ORGANIZATIONS.LOAD_ERROR')}</p>
        ) : (
          <div className="mt-4 space-y-4">
            {active.map((org) => (
              <div
                key={org.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <OrgAvatar org={org} />
                  <span className="font-semibold text-gray-900 truncate">{org.name}</span>
                  {org.isDefault && (
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      {t('ORGANIZATIONS.DEFAULT_BADGE')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!org.isDefault && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busyId === org.id}
                        onClick={() => setDialog({ type: 'setDefault', org })}
                      >
                        {t('ORGANIZATIONS.SET_AS_DEFAULT')}
                      </Button>
                      {/* You can never leave your default organization, so the
                          action only exists for the others. */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        disabled={busyId === org.id}
                        onClick={() => setDialog({ type: 'leave', org })}
                      >
                        {t('ORGANIZATIONS.LEAVE')}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending invitations */}
      {pending.length > 0 && (
        <div className="mt-8">
          <div className="border-t border-gray-200" />
          <h3 className="mt-6 text-sm font-medium text-gray-900">
            {t('ORGANIZATIONS.PENDING_TITLE')}
          </h3>
          <div className="mt-4 space-y-4">
            {pending.map((org) => (
              <div
                key={org.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <OrgAvatar org={org} />
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{org.name}</p>
                    <p className="text-sm text-gray-500">
                      {t('ORGANIZATIONS.INVITED_AGO', { time: relativeTime(org.invitedAt) })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busyId === org.id}
                    onClick={() =>
                      membershipAction(org, 'accept', 'ORGANIZATIONS.TOASTS.JOINED')
                    }
                  >
                    {t('ORGANIZATIONS.JOIN')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    disabled={busyId === org.id}
                    onClick={() => setDialog({ type: 'decline', org })}
                  >
                    {t('ORGANIZATIONS.DECLINE')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AlertDialog open={!!dialog} onOpenChange={(open) => !open && setDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogCopy?.title}</AlertDialogTitle>
            <AlertDialogDescription>{dialogCopy?.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{dialogCopy?.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDialog}
              className={
                dialog?.type === 'setDefault'
                  ? 'bg-gray-900 hover:bg-gray-800 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }
            >
              {dialogCopy?.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toast
        title={toast?.title ?? ''}
        isVisible={!!toast}
        onClose={() => setToast(null)}
      />
    </div>
  )
}
