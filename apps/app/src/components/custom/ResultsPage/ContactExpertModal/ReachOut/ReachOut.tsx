// Components
import Modal from "@/components/common/Modal/Modal"

export interface ReachOutProps {
  title: string
  description: string
  primaryButtonLabel: string
  secondaryButtonLabel: string
}

interface ExtraProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const ReachOut = ({ isOpen, setIsOpen }: ReachOutProps & ExtraProps) => {
  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <h1>ReachOut</h1>
    </Modal>
  )
}

export default ReachOut
