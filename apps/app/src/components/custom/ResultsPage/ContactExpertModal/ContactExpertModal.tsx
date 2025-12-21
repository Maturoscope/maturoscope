// Packages
import { useState } from "react"
// Components
import SupportNeeded from "./SupportNeeded/SupportNeeded"
import ReachOut from "./ReachOut/ReachOut"
import Status from "./Status/Status"
// Context
import { ContactExpertProvider } from "@/context/ContactExpertContext"
// Types
import { ComponentType } from "react"
import { Dictionary } from "@/dictionaries/types"

export interface CommonModalStepProps {
  title: string
  description: string
  primaryButtonLabel: string
  secondaryButtonLabel: string
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  setCurrentStep: (step: ModalStep) => void
}

interface ContactExpertModalProps {
  dictionary: Dictionary
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export type ModalStep =
  | "supportNeeded"
  | "reachOut"
  | "successStatus"
  | "failedStatus"

const MODAL_STEPS: Record<ModalStep, ComponentType<CommonModalStepProps>> = {
  supportNeeded:
    SupportNeeded as unknown as ComponentType<CommonModalStepProps>,
  reachOut: ReachOut as unknown as ComponentType<CommonModalStepProps>,
  successStatus: Status,
  failedStatus: Status,
}

const ContactExpertModal = ({
  dictionary,
  isOpen,
  setIsOpen,
}: ContactExpertModalProps) => {
  const [currentStep, setCurrentStep] = useState<ModalStep>("supportNeeded")
  const CurrentStepComponent = MODAL_STEPS[currentStep]

  const {
    results: { contactExpertModal },
  } = dictionary
  const currentStepProps = contactExpertModal[currentStep]

  return (
    <ContactExpertProvider>
      <CurrentStepComponent
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        setCurrentStep={setCurrentStep}
        {...currentStepProps}
      />
    </ContactExpertProvider>
  )
}

export default ContactExpertModal
