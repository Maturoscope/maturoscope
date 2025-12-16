// Packages
import Image from "next/image"
// Components
import Accordion from "@/components/common/Accordion/Accordion"
// Utils
import { cn } from "@/lib/utils"

interface AccordionTriggerProps {
  isOpen: boolean
  index: number
  title: string
  serviceLabel: string
  comingSoonLabel: string
  hasServices: boolean
  indexColor: string
  handleClick: () => void
}

interface ServiceAccordionProps {
  index: number
  title: string
  serviceLabel: string
  comingSoonLabel: string
  hasServices: boolean
  indexColor: string
}

const AccordionTrigger = ({
  isOpen,
  index,
  title,
  serviceLabel,
  comingSoonLabel,
  hasServices,
  indexColor,
  handleClick,
}: AccordionTriggerProps) => {
  const handleTriggerClick = () => {
    if (hasServices) handleClick()
  }

  return (
    <button
      onClick={handleTriggerClick}
      className={cn(
        "flex items-center justify-between py-4 gap-4",
        hasServices && "cursor-pointer"
      )}
    >
      <div className="flex items-center gap-2 text-foreground font-semibold">
        <span className={cn("rounded-full w-6 h-6 shrink-0", indexColor)}>
          {index + 1}
        </span>
        <h1 className="text-base font-semibold text-left">{title}</h1>
      </div>

      <div className="w-max flex items-center gap-2.5 shrink-0">
        <span
          className={cn(
            "text-xs font-semibold uppercase",
            hasServices ? "text-[#0D9488]" : "text-[#854D0E]"
          )}
        >
          {hasServices ? serviceLabel : comingSoonLabel}
        </span>
        <Image
          src="/icons/chevron-down.svg"
          alt="chevron down"
          width={16}
          height={16}
          className={cn(isOpen && "rotate-180", !hasServices && "opacity-50")}
        />
      </div>
    </button>
  )
}

const ServiceAccordion = ({
  index,
  title,
  serviceLabel,
  comingSoonLabel,
  hasServices,
  indexColor,
}: ServiceAccordionProps) => {
  return (
    <Accordion
      trigger={(isOpen, handleClick) => (
        <AccordionTrigger
          index={index}
          isOpen={isOpen}
          title={title}
          serviceLabel={serviceLabel}
          comingSoonLabel={comingSoonLabel}
          hasServices={hasServices}
          indexColor={indexColor}
          handleClick={handleClick}
        />
      )}
      // content={<div>Content</div>}
      className="border-b border-border last:border-b-0"
    />
  )
}

export default ServiceAccordion
