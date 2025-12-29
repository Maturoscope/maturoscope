// Packages
import { useState } from "react"
// Components
import SupportNeeded from "./SupportNeeded/SupportNeeded"
import ReachOut from "./ReachOut/ReachOut"
import Status from "./Status/Status"
// Context
import { useContactExpertContext } from "@/context/ContactExpertContext"
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
  currentStep?: ModalStep
}

interface ContactExpertModalProps {
  dictionary: Dictionary
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

const ContactExpertModal = ({ dictionary }: ContactExpertModalProps) => {
  const { isModalOpen, closeModal } = useContactExpertContext()
  const [currentStep, setCurrentStep] = useState<ModalStep>("supportNeeded")
  const CurrentStepComponent = MODAL_STEPS[currentStep]

  const {
    results: { contactExpertModal },
  } = dictionary
  const currentStepProps = contactExpertModal[currentStep]

  return (
    <CurrentStepComponent
      isOpen={isModalOpen}
      setIsOpen={closeModal}
      setCurrentStep={setCurrentStep}
      currentStep={currentStep}
      {...currentStepProps}
    />
  )
}

export default ContactExpertModal
