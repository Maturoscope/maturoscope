"use client"

// Packages
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
// Utils
import { cn } from "@/lib/utils"

export interface ModalProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  children: React.ReactNode
  className?: string
  closeOnOverlayClick?: boolean
}

const Modal = ({
  isOpen,
  setIsOpen,
  children,
  className,
  closeOnOverlayClick = true,
}: ModalProps) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) =>
    e.stopPropagation()

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) setIsOpen(false)
  }

  // Render into a portal on document.body so the fixed overlay is positioned
  // relative to the viewport, not any transformed ancestor (e.g. the FadeIn
  // reveal wrapper, whose lingering `transform` would otherwise make the
  // overlay only cover part of the screen).
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (isOpen) document.body.style.overflowY = "hidden"
    else document.body.style.overflowY = ""

    return () => {
      document.body.style.overflowY = ""
    }
  }, [isOpen])

  if (!mounted) return null

  // The overlay stays mounted and fades via a pure CSS opacity transition
  // (toggled by `isOpen`), rather than mounting/unmounting a framer-motion
  // element on each open. A freshly-mounted animated element re-runs its enter
  // animation whenever React StrictMode double-invokes mount effects (dev),
  // which showed up as the modal flickering closed-then-open. A CSS transition
  // on an always-present node has no such lifecycle to double-fire.
  return createPortal(
    <div
      onClick={handleOverlayClick}
      aria-hidden={!isOpen}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 lg:px-0",
        "transition-opacity duration-200 ease-out",
        isOpen ? "opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <div
        onClick={handleClick}
        className={cn("bg-white p-6 rounded-lg", className)}
      >
        {isOpen && children}
      </div>
    </div>,
    document.body
  )
}

export default Modal
