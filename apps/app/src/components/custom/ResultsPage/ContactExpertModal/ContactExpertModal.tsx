// Packages
import { useState } from "react"
// Components
import SupportNeeded from "./SupportNeeded/SupportNeeded"
import ReachOut from "./ReachOut/ReachOut"
import Status from "./Status/Status"
// Context
import { useContactExpertContext } from "@/context/ContactExpertContext"
// Types
import { Dictionary } from "@/dictionaries/types"

interface ContactExpertModalProps {
  dictionary: Dictionary
}

export type ModalStep =
  | "supportNeeded"
  | "reachOut"
  | "successStatus"
  | "failedStatus"

const ContactExpertModal = ({ dictionary }: ContactExpertModalProps) => {
  const { isModalOpen, closeModal } = useContactExpertContext()
  const [currentStep, setCurrentStep] = useState<ModalStep>("supportNeeded")

  const {
    results: { contactExpertModal },
  } = dictionary

  const renderStep = () => {
    switch (currentStep) {
      case "supportNeeded":
        return (
          <SupportNeeded
            {...contactExpertModal.supportNeeded}
            isOpen={isModalOpen}
            setIsOpen={closeModal}
            setCurrentStep={setCurrentStep}
          />
        )
      case "reachOut":
        return (
          <ReachOut
            {...contactExpertModal.reachOut}
            isOpen={isModalOpen}
            setIsOpen={closeModal}
            setCurrentStep={setCurrentStep}
          />
        )
      case "successStatus":
        return (
          <Status
            {...contactExpertModal.successStatus}
            isOpen={isModalOpen}
            setIsOpen={closeModal}
            currentStep={currentStep}
          />
        )
      case "failedStatus":
        return (
          <Status
            {...contactExpertModal.failedStatus}
            isOpen={isModalOpen}
            setIsOpen={closeModal}
            currentStep={currentStep}
          />
        )
    }
  }

  return <>{renderStep()}</>
}

export default ContactExpertModal
