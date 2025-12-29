"use client"

// Packages
import Image from "next/image"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useParams } from "next/navigation"
// Components
import Modal from "@/components/common/Modal/Modal"
import { Button } from "@/components/ui/button"
// Types
import { ModalStep } from "../ContactExpertModal"
import { Locale } from "@/dictionaries/dictionaries"

export interface ReachOutProps {
  title: string
  description: string
  primaryButtonLabel: string
  secondaryButtonLabel: string
  completedLabel: string
  clarification: string
  fields: {
    name: string
    label: string
    placeholder: string
    required: boolean
  }[]
}

interface ExtraProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  setCurrentStep: (step: ModalStep) => void
}

interface ContactInfoFieldProps {
  name: string,
  label: string,
  placeholder: string,
  type: "text" | "email" | "phone" | "textarea" | "country",
  required?: boolean,
}

type ContactInfoField = "organization" | "country" | "firstName" | "lastName" | "email" | "phone" | "additionalInformation"

type ContactInfoForm = Record<ContactInfoField, ContactInfoFieldProps>

const EN_CONTACT_INFO_FIELDS: ContactInfoForm = {
  organization: {
    name: "organization",
    label: "Organization",
    placeholder: "Organization",
    type: "text",
  },
  country: {
    name: "country",
    label: "Country",
    placeholder: "Select",
    type: "country",
    required: true,
  },
  firstName: {
    name: "firstName",
    label: "First Name",
    placeholder: "First Name",
    type: "text",
    required: true,
  },
  lastName: {
    name: "lastName",
    label: "Last Name",
    placeholder: "Last Name",
    type: "text",
    required: true,
  },
  email: {
    name: "email",
    label: "Email",
    placeholder: "Email",
    type: "email",
    required: true,
  },
  phone: {
    name: "phone",
    label: "Phone",
    placeholder: "Phone",
    type: "phone",
  },
  additionalInformation: {
    name: "additionalInformation",
    label: "Additional Information",
    placeholder: "Share any relevant details about your project",
    type: "textarea",
  },
}

const FR_CONTACT_INFO_FIELDS: ContactInfoForm = {
  organization: {
    name: "organization",
    label: "Entreprise",
    placeholder: "Entreprise",
    type: "text",
  },
  country: {
    name: "country",
    label: "Pays",
    placeholder: "Sélectionner",
    type: "country",
    required: true,
  },
  firstName: {
    name: "firstName",
    label: "Prénom",
    placeholder: "Prénom",
    type: "text",
    required: true,
  },
  lastName: {
    name: "lastName",
    label: "Nom",
    placeholder: "Nom",
    type: "text",
    required: true,
  },
  email: {
    name: "email",
    label: "Email",
    placeholder: "Email",
    type: "email",
    required: true,
  },
  phone: {
    name: "phone",
    label: "Numéro de téléphone",
    placeholder: "Numéro de téléphone",
    type: "phone",
  },
  additionalInformation: {
    name: "additionalInformation",
    label: "Informations supplémentaires",
    placeholder: "Partagez toutes les informations pertinentes sur votre projet",
    type: "textarea",
  },
}

const ReachOut = ({
  title,
  description,
  primaryButtonLabel,
  secondaryButtonLabel,
  completedLabel,
  isOpen,
  setIsOpen,
  setCurrentStep,
}: ReachOutProps & ExtraProps) => {
  const { register, handleSubmit } = useForm()
  const [contactInfo, setContactInfo] = useState(EN_CONTACT_INFO_FIELDS)
  const { lang } = useParams<{ lang: Locale }>()

  const onSubmit = (data: any) => {
    console.log(data)
  }

  useEffect(() => {
    setContactInfo(lang === "en" ? EN_CONTACT_INFO_FIELDS : FR_CONTACT_INFO_FIELDS)
  }, [lang])

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      className="p-6 max-w-[740px] w-full"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-base font-semibold">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <div className="h-1 w-20 aspect-20/1 relative bg-neutral-100 rounded-full after:content-[''] after:absolute after:left-0 after:top-0 after:h-full after:w-full after:bg-primary after:rounded-full" />
              <span className="text-sm text-muted-foreground">
                2/2 {completedLabel}
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

        <div>

        </div>

        <div className="flex justify-between w-full gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentStep("supportNeeded")}
          >
            {secondaryButtonLabel}
          </Button>
          <Button variant="default" accent>
            {primaryButtonLabel}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ReachOut
