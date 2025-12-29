import Modal from "@/components/common/Modal/Modal"
import { Button } from "@/components/ui/button"

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

const Status = ({
  isOpen,
  setIsOpen,
  title,
  description,
  primaryButtonLabel,
  secondaryButtonLabel,
}: StatusProps & ExtraProps) => {

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} className="max-w-[512px]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-base font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="flex justify-end w-full gap-2">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            {secondaryButtonLabel}
          </Button>
          <Button
            variant="default"
            onClick={() => setIsOpen(false)}
            accent
          >
            {primaryButtonLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default Status
