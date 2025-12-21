import Modal from "@/components/common/Modal/Modal"

export interface StatusProps {
  title: string
  description: string
  primaryButtonLabel: string
  secondaryButtonLabel: string
}

interface ExtraProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}
const Status = ({ isOpen, setIsOpen }: StatusProps & ExtraProps) => {
  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <h1>Status</h1>
    </Modal>
  )
}

export default Status
