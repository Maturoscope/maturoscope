// Packages
import Image from "next/image"
// Components
import Modal from "@/components/common/Modal/Modal"
import { Button } from "@/components/ui/button"

export interface SupportNeededProps {
  title: string
  description: string
  primaryButtonLabel: string
  completedLabel: string
  chipLabel: string
}

interface ExtraProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const SupportNeeded = ({
  title,
  description,
  primaryButtonLabel,
  completedLabel,
  chipLabel,
  isOpen,
  setIsOpen,
}: SupportNeededProps & ExtraProps) => {
  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      className="p-6 flex flex-col gap-4 max-w-[740px] w-full"
    >
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-base font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <div className="h-1 w-20 aspect-20/1 relative bg-neutral-100 rounded-full after:content-[''] after:absolute after:left-0 after:top-0 after:h-full after:w-1/2 after:bg-primary after:rounded-full" />
            <span className="text-sm text-muted-foreground">
              1/2 {completedLabel}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="bg-border w-px h-3.5" />
            <div className="cursor-pointer size-8 flex items-center justify-center">
              <Image
                src="/icons/common/cross.svg"
                alt="Close"
                width={16}
                height={16}
              />
            </div>
          </div>
        </div>
      </div>

      <div></div>

      <div className="flex justify-end">
        <Button variant="default" accent>
          {primaryButtonLabel}
        </Button>
      </div>
    </Modal>
  )
}

export default SupportNeeded
