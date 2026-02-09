"use client"

import React, { useEffect, useState, useCallback } from 'react'
import { CircleCheck } from 'lucide-react'
import { Button } from './button'

interface ToastProps {
  title: string
  description?: string
  isVisible: boolean
  onClose: () => void
  onUndo?: () => void
  undoText?: string
  duration?: number
  showIcon?: boolean
}

export function Toast({ 
  title, 
  description, 
  isVisible, 
  onClose, 
  onUndo, 
  undoText = "Undo",
  duration = 5000,
  showIcon = true
}: ToastProps) {
  const [show, setShow] = useState(false)

  const handleClose = useCallback(() => {
    setShow(false)
    setTimeout(() => {
      onClose()
    }, 300)
  }, [onClose])

  useEffect(() => {
    if (isVisible) {
      setShow(true)
      const timer = setTimeout(() => {
        handleClose()
      }, duration)
      
      return () => clearTimeout(timer)
    } else {
      setShow(false)
    }
  }, [isVisible, duration, handleClose])

  const handleUndo = () => {
    if (onUndo) {
      onUndo()
    }
    handleClose()
  }

  if (!isVisible && !show) return null

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div 
        className={`
          min-w-[440px] max-w-md bg-white border border-gray-200 rounded-lg shadow-lg p-4
          transform transition-all duration-300 ease-in-out
          ${show ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
        `}
      >
        <div className="flex items-start gap-3">
          {showIcon && (
            <div className="shrink-0">
              <CircleCheck className="h-6 w-6 text-[#0A0A0A]" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#0A0A0A]">
              {title}
            </p>
            {description && (
              <p className="text-sm text-gray-500 mt-1">
                {description}
              </p>
            )}
          </div>
          
          {onUndo && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              className="text-sm font-medium bg-gray-100 hover:bg-gray-200 text-[#0A0A0A] border-gray-300 rounded-md shrink-0"
            >
              {undoText}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
