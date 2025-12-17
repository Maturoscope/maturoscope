"use client"

// Packages
import { AnimatePresence, motion } from "framer-motion"
// Utils
import { cn } from "@/lib/utils"
// Animations
import { SIMPLE_FADE_VARIANT } from "@/animations/common"

export interface ModalProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  children: React.ReactNode
  className?: string
}

const Modal = ({ isOpen, setIsOpen, children, className }: ModalProps) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) =>
    e.stopPropagation()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={SIMPLE_FADE_VARIANT}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.2 }}
          onClick={() => setIsOpen(false)}
          className="w-full h-full fixed top-0 left-0 bg-black/40 z-50 px-4 lg:px-0 flex items-center justify-center"
        >
          <div
            onClick={handleClick}
            className={cn("bg-white p-6 rounded-lg", className)}
          >
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Modal
