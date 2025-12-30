// Components
import Modal from "@/components/common/Modal/Modal"
import { Button } from "@/components/ui/button"

export interface LeaveQuestionnaireModalProps {
  title: string
  description: string
  resetButtonLabel: string
  cancelButtonLabel: string
}

interface ExtraProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  onResetClick: () => void
}

const LeaveQuestionnaireModal = ({
  title,
  description,
  resetButtonLabel,
  cancelButtonLabel,
  isOpen,
  setIsOpen,
  onResetClick
}: LeaveQuestionnaireModalProps & ExtraProps) => {
  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} className="max-w-[512px] w-full h-max flex flex-col">
      <h1 className="text-lg font-semibold mb-2">{title}</h1>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <div className="flex flex-row gap-2 justify-end">
        <Button variant="outline" onClick={onResetClick}>{resetButtonLabel}</Button>
        <Button variant="default" onClick={() => setIsOpen(false)} accent>{cancelButtonLabel}</Button>
      </div>
    </Modal>
  )
}

export default LeaveQuestionnaireModal