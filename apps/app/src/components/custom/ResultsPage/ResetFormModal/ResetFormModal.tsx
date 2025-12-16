// Types
import { ModalProps } from "@/components/common/Modal/Modal"
// Components
import Modal from "@/components/common/Modal/Modal"
import { Button } from "@/components/ui/button"

export interface ResetFormModalProps {
  title: string
  description: string
  downloadButtonLabel: string
  cancelButtonLabel: string
  resetButtonLabel: string
}

interface ExtraProps {
  onDownloadClick: () => void
  onResetClick: () => void
}

const ResetFormModal = ({
  title,
  description,
  downloadButtonLabel,
  cancelButtonLabel,
  resetButtonLabel,
  isOpen,
  setIsOpen,
  onDownloadClick,
  onResetClick,
}: ResetFormModalProps & Omit<ModalProps, "children"> & ExtraProps) => {
  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      className="max-w-[512px] w-full h-max flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-col lg:flex-row-reverse gap-2 justify-between">
        <div className="flex flex-col lg:flex-row-reverse gap-2">
          <Button accent onClick={onDownloadClick}>
            {downloadButtonLabel}
          </Button>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            {cancelButtonLabel}
          </Button>
        </div>
        <Button variant="destructive" onClick={onResetClick}>
          {resetButtonLabel}
        </Button>
      </div>
    </Modal>
  )
}

export default ResetFormModal
