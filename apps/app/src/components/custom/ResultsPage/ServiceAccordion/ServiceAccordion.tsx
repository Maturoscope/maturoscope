// Packages
import Image from "next/image"
// Components
import Accordion from "@/components/common/Accordion/Accordion"
// Utils
import { cn } from "@/lib/utils"
// Types
import { RecommendedService } from "@/actions/organization"
import { Locale } from "@/dictionaries/dictionaries"

interface AccordionTriggerProps {
  isOpen: boolean
  index: number
  title: string
  serviceLabel: string
  servicesLabel: string
  comingSoonLabel: string
  hasServices: boolean
  serviceCount: number
  indexColor: string
  handleClick: () => void
}

interface ServiceAccordionProps {
  index: number
  title: string
  serviceLabel: string
  servicesLabel: string
  comingSoonLabel: string
  recommendedServices: RecommendedService[]
  hasServices: boolean
  indexColor: string
  lang: Locale
}

const AccordionTrigger = ({
  isOpen,
  index,
  title,
  serviceLabel,
  servicesLabel,
  comingSoonLabel,
  hasServices,
  serviceCount,
  indexColor,
  handleClick,
}: AccordionTriggerProps) => {
  const resolvedServiceLabel = serviceCount > 1 ? servicesLabel : serviceLabel
  const handleTriggerClick = () => {
    if (hasServices) handleClick()
  }

  return (
    <div className="flex flex-col">
      <button
        onClick={handleTriggerClick}
        className={cn(
          "flex items-center justify-between py-4 gap-4",
          hasServices && "cursor-pointer"
        )}
      >
        <div className="flex items-start lg:items-center gap-2 text-foreground font-semibold">
          <span className={cn("rounded-full w-6 h-6 shrink-0", indexColor)}>
            {index + 1}
          </span>
          <h1 className="text-sm lg:text-base font-semibold text-left">
            {title}
          </h1>
        </div>

        <div className="w-max flex items-center gap-2.5 shrink-0">
          <span
            className={cn(
              "text-xs font-semibold uppercase hidden lg:block",
              hasServices ? "text-[#0D9488]" : "text-[#854D0E]"
            )}
          >
            {hasServices ? resolvedServiceLabel : comingSoonLabel}
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

      {isOpen && (
        <span
          className={cn(
            "text-xs font-semibold uppercase block lg:hidden ml-8 pb-2.5",
            hasServices ? "text-[#0D9488]" : "text-[#854D0E]"
          )}
        >
          {hasServices ? resolvedServiceLabel : comingSoonLabel}
        </span>
      )}
    </div>
  )
}

const AccordionContent = ({
  recommendedServices,
  lang,
}: {
  recommendedServices: RecommendedService[]
  lang: Locale
}) => {
  return (
    <ul className="flex flex-col pl-8 mb-4">
      {recommendedServices.map((service, idx) => (
        <li
          key={service.id}
          className={cn(
            "flex flex-col gap-1",
            idx !== 0 && "border-t border-border pt-3 mt-4"
          )}
        >
          <span className="text-sm lg:text-base font-semibold text-foreground">
            {service.name[lang]}
          </span>
          <span className="text-sm text-muted-foreground max-w-[900px]">
            {service.description[lang]}
          </span>
          {service.url && (
            <a
              href={service.url.startsWith("http") ? service.url : `https://${service.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-[#0A0A0A] hover:underline mt-2.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              {service.url}
            </a>
          )}
        </li>
      ))}
    </ul>
  )
}

const ServiceAccordion = ({
  index,
  title,
  serviceLabel,
  servicesLabel,
  comingSoonLabel,
  recommendedServices = [],
  hasServices,
  indexColor,
  lang,
}: ServiceAccordionProps) => {
  return (
    <Accordion
      trigger={(isOpen, handleClick) => (
        <AccordionTrigger
          index={index}
          isOpen={isOpen}
          title={title}
          serviceLabel={serviceLabel}
          servicesLabel={servicesLabel}
          comingSoonLabel={comingSoonLabel}
          hasServices={hasServices}
          serviceCount={recommendedServices.length}
          indexColor={indexColor}
          handleClick={handleClick}
        />
      )}
      content={() => (
        <AccordionContent
          recommendedServices={recommendedServices}
          lang={lang}
        />
      )}
      className="border-b border-border last:border-b-0"
    />
  )
}

export default ServiceAccordion
