"use client"

import React from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface WelcomeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WelcomeModal({ open, onOpenChange }: WelcomeModalProps) {
  const { t } = useTranslation('WELCOME_MODAL')
  const router = useRouter()

  const handleGoToSettings = () => {
    onOpenChange(false)
    router.push('/dashboard/settings')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[512px] h-[176px] p-6 flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-[18px] font-semibold">
            {t('TITLE')}
          </DialogTitle>
          <DialogDescription className="text-[14px] text-gray-600 mt-2">
            {t('DESCRIPTION')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 mt-auto">
          <Button
            onClick={handleGoToSettings}
            className="bg-gray-900 hover:bg-gray-800 text-white text-[14px]"
          >
            {t('GO_TO_SETTINGS')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

