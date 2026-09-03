"use client"

// Packages
import { useState } from "react"
import Image from "next/image"
// Utils
import { cn } from "@/lib/utils"
// Types
import { RecommendedService } from "@/actions/organization"
import { Locale } from "@/dictionaries/dictionaries"

interface ServiceAccordionProps {
  index: number
  gapLabel: string
  title: string
  serviceLabel: string
  servicesLabel: string
  comingSoonLabel: string
  servicesColumnLabel: string
  descriptionColumnLabel: string
  recommendedServices: RecommendedService[]
  hasServices: boolean
  lang: Locale
}

const ExternalLinkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="inline-block align-middle ml-1 shrink-0"
  >
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
)

// Plain (non-flex) anchor with break-all so a very long URL wraps onto multiple
// lines inside its column instead of overflowing into the description. The
// colour is the organization's accent (--accent, set from the backend theme).
const ServiceLink = ({ url }: { url: string }) => (
  <a
    href={url.startsWith("http") ? url : `https://${url}`}
    target="_blank"
    rel="noopener noreferrer"
    className="text-sm font-medium text-accent hover:underline break-all"
  >
    {url}
    <ExternalLinkIcon />
  </a>
)

const ServiceAccordion = ({
  index,
  gapLabel,
  title,
  serviceLabel,
  servicesLabel,
  comingSoonLabel,
  servicesColumnLabel,
  descriptionColumnLabel,
  recommendedServices = [],
  hasServices,
  lang,
}: ServiceAccordionProps) => {
  const [isOpen, setIsOpen] = useState(true)

  // The gap title is dark only while its services are actually shown; once
  // collapsed (or when there are no services) it dims to a muted grey.
  const isExpanded = isOpen && hasServices

  const resolvedServiceLabel =
    recommendedServices.length > 1 ? servicesLabel : serviceLabel

  const handleTriggerClick = () => {
    if (hasServices) setIsOpen((prev) => !prev)
  }

  return (
    <div className="flex flex-col border-b border-border last:border-b-0 py-4">
      {/* Gap header */}
      <button
        onClick={handleTriggerClick}
        className={cn(
          "flex items-start justify-between gap-4 w-full text-left",
          hasServices && "cursor-pointer"
        )}
      >
        <div className="flex items-start gap-2.5 min-w-0">
          <Image
            src="/icons/chevron-down.svg"
            alt=""
            width={16}
            height={16}
            className={cn(
              "mt-1 shrink-0 transition-transform",
              isOpen ? "rotate-180" : "rotate-0",
              !hasServices && "opacity-40"
            )}
          />
          <h3
            className={cn(
              "text-sm lg:text-base font-medium",
              isExpanded ? "text-foreground" : "text-[#52525B]"
            )}
          >
            {gapLabel} {index + 1}: {title}
          </h3>
        </div>

        <span
          className={cn(
            "shrink-0 text-xs font-semibold uppercase pt-1 hidden lg:block",
            hasServices ? "text-[#0D9488]" : "text-[#854D0E]"
          )}
        >
          {hasServices ? resolvedServiceLabel : comingSoonLabel}
        </span>
      </button>

      {/* Mobile badge (below the title) */}
      <span
        className={cn(
          "text-xs font-semibold uppercase block lg:hidden ml-[26px] mt-2",
          hasServices ? "text-[#0D9488]" : "text-[#854D0E]"
        )}
      >
        {hasServices ? resolvedServiceLabel : comingSoonLabel}
      </span>

      {/* Services table (expanded by default) */}
      {isOpen && hasServices && (
        <div className="flex flex-col mt-4">
          {/* Column headers: two columns on desktop, single "Services" on mobile */}
          <div className="bg-neutral-50 rounded-lg px-4 py-2.5 lg:grid lg:grid-cols-[38%_1fr] lg:gap-6">
            <span className="text-sm text-muted-foreground">
              {servicesColumnLabel}
            </span>
            <span className="text-sm text-muted-foreground hidden lg:block">
              {descriptionColumnLabel}
            </span>
          </div>

          {/* Rows */}
          {recommendedServices.map((service, idx) => (
            <div
              key={service.id}
              className={cn(
                "flex flex-col gap-2 px-4 py-4 rounded-lg lg:grid lg:grid-cols-[38%_1fr] lg:gap-6",
                idx % 2 === 1 && "bg-neutral-50"
              )}
            >
              <div className="flex flex-col gap-1.5 min-w-0">
                <span className="text-sm font-medium text-foreground">
                  {service.name[lang]}
                </span>
                {service.url && <ServiceLink url={service.url} />}
              </div>
              <span className="text-sm text-muted-foreground">
                {service.description[lang]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ServiceAccordion
