"use client"

// Packages
import { useState } from "react"
// Utils
import { cn } from "@/lib/utils"

interface AccordionProps {
  trigger: (isOpen: boolean, handleClick: () => void) => React.ReactNode
  content?: React.ReactNode
  className?: string
}

const Accordion = ({ trigger, content, className }: AccordionProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleClick = () => setIsOpen(!isOpen)
  const TriggerComponent = () => trigger(isOpen, handleClick)

  return (
    <div className={cn("flex flex-col w-full", className)}>
      <TriggerComponent />
      {isOpen && <div>{content}</div>}
    </div>
  )
}

export default Accordion
