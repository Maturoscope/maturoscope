"use client"

// Packages
import { createContext, useContext, useState } from "react"

export interface SelectedGap {
  questionId: string
  level: number
  recommendedServices: string[]
}

interface ContactExpertContextType {
  selectedGaps: SelectedGap[]
  setSelectedGaps: (gaps: SelectedGap[]) => void
  addGap: (gap: SelectedGap) => void
  removeGap: (questionId: string) => void
  isGapSelected: (questionId: string) => boolean
  isModalOpen: boolean
  openModal: () => void
  closeModal: () => void
}

interface ContactExpertProviderProps {
  children: React.ReactNode
}

const ContactExpertContext = createContext<ContactExpertContextType | null>(
  null
)

export const ContactExpertProvider = ({
  children,
}: ContactExpertProviderProps) => {
  const [selectedGaps, setSelectedGaps] = useState<SelectedGap[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  const addGap = (gap: SelectedGap) => {
    setSelectedGaps((prev) => {
      const exists = prev.some((g) => g.questionId === gap.questionId)
      if (exists) return prev
      return [...prev, gap]
    })
  }

  const removeGap = (questionId: string) => {
    setSelectedGaps((prev) => prev.filter((g) => g.questionId !== questionId))
  }

  const isGapSelected = (questionId: string) => {
    return selectedGaps.some((g) => g.questionId === questionId)
  }

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  return (
    <ContactExpertContext.Provider
      value={{
        selectedGaps,
        setSelectedGaps,
        addGap,
        removeGap,
        isGapSelected,
        isModalOpen,
        openModal,
        closeModal,
      }}
    >
      {children}
    </ContactExpertContext.Provider>
  )
}

export const useContactExpertContext = () => {
  const context = useContext(ContactExpertContext)
  if (!context) {
    throw new Error(
      "useContactExpertContext must be used within a ContactExpertProvider"
    )
  }
  return context
}
