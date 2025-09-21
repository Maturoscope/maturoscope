"use client"

import React, { useEffect, useState } from 'react'
import { CircleCheck, X } from 'lucide-react'
import { Button } from './button'

interface ToastProps {
  title: string
  description?: string
  isVisible: boolean
  onClose: () => void
  onUndo?: () => void
  undoText?: string
  duration?: number
}

export function Toast({ 
  title, 
  description, 
  isVisible, 
  onClose, 
  onUndo, 
  undoText = "Undo",
  duration = 5000 
}: ToastProps) {
  const [show, setShow] = useState(false)

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
  }, [isVisible, duration])

  const handleClose = () => {
    setShow(false)
    setTimeout(() => {
      onClose()
    }, 300)
  }

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
          max-w-md bg-white border border-gray-200 rounded-lg shadow-lg p-4
          transform transition-all duration-300 ease-in-out
          ${show ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
        `}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <CircleCheck className="h-5 w-5 text-gray-900" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {title}
            </p>
            {description && (
              <p className="text-sm text-gray-500 mt-1">
                {description}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {onUndo && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                className="text-sm text-gray-600 hover:text-gray-900 px-2 py-1 h-auto"
              >
                {undoText}
              </Button>
            )}
            
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
