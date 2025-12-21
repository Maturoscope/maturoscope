"use client"

// Context
import { ContactExpertProvider } from "@/context/ContactExpertContext"
// Components
import ContactExpertModal from "@/components/custom/ResultsPage/ContactExpertModal/ContactExpertModal"
// Types
import { Dictionary } from "@/dictionaries/types"

interface ResultsPageWrapperProps {
  dictionary: Dictionary
  children: React.ReactNode
}

const ResultsPageWrapper = ({
  dictionary,
  children,
}: ResultsPageWrapperProps) => {
  return (
    <ContactExpertProvider>
      {children}
      <ContactExpertModal dictionary={dictionary} />
    </ContactExpertProvider>
  )
}

export default ResultsPageWrapper

