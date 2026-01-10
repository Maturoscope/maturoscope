"use client"

// Packages
import Image from "next/image"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useParams } from "next/navigation"
// Components
import Modal from "@/components/common/Modal/Modal"
import { Button } from "@/components/ui/button"
import Input from "@/components/common/Input/Input"
// Context
import { useContactExpertContext } from "@/context/ContactExpertContext"
// Actions
import { requestContact } from "@/actions/organization"
// Types
import { ModalStep } from "../ContactExpertModal"
import { Locale } from "@/dictionaries/dictionaries"

export interface ReachOutProps {
  title: string
  description: string
  primaryButtonLabel: string
  secondaryButtonLabel: string
  completedLabel: string
  clarification?: string
  fields?: {
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

// TODO: Add country field for v2
type ContactInfoField = "organization" | "firstName" | "lastName" | "email" | "phoneNumber" | "additionalInformation"

type ContactInfoForm = Record<ContactInfoField, ContactInfoFieldProps>

// Form data type - matches the structure of ContactInfoForm with field names as keys
// Uses the 'name' property from each ContactInfoFieldProps as the key
type ContactFormData = {
  organization?: string
  country?: string
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string // Note: field key is "phone" but name is "phoneNumber"
  additionalInformation?: string
}

const EN_CONTACT_INFO_FIELDS: ContactInfoForm = {
  organization: {
    name: "organization",
    label: "Organization",
    placeholder: "Organization",
    type: "text",
  },
  // country: {
  //   name: "country",
  //   label: "Country",
  //   placeholder: "Select",
  //   type: "country",
  //   required: true,
  // },
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
  phoneNumber: {
    name: "phoneNumber",
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
  // country: {
  //   name: "country",
  //   label: "Pays",
  //   placeholder: "Sélectionner",
  //   type: "country",
  //   required: true,
  // },
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
  phoneNumber: {
    name: "phoneNumber",
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

const EN_CLARIFICATION = "We respect your privacy. Your data is used exclusively to answer this inquiry."
const EN_LOADING_BUTTON_LABEL = "Loading..."
const FR_CLARIFICATION = "Nous respectons votre vie privée. Vos données sont utilisées exclusivement pour répondre à cette demande."
const FR_LOADING_BUTTON_LABEL = "Chargement..."

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
  const [isLoading, setIsLoading] = useState(false)
  const { setContactInformation, selectedGaps } = useContactExpertContext()
  const { control, handleSubmit, formState } = useForm<ContactFormData>({
    mode: "onChange",
    defaultValues: {
      organization: "",
      // country: "",
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      additionalInformation: "",
    },
  })
  const [contactInfo, setContactInfo] = useState(EN_CONTACT_INFO_FIELDS)
  const { lang } = useParams<{ lang: Locale }>()
  const loadingButtonLabel = lang === "en" ? EN_LOADING_BUTTON_LABEL : FR_LOADING_BUTTON_LABEL
  const clarification = lang === "en" ? EN_CLARIFICATION : FR_CLARIFICATION

  const onSubmit = async (data: ContactFormData) => {
    setContactInformation(data)
    const projectName = localStorage.getItem("projectName")

    setIsLoading(true)
    const result = await requestContact({
      gaps: selectedGaps,
      contactInformation: data,
      projectName: projectName as string,
    })
    setIsLoading(false)

    // Set flag to indicate user has completed the contact expert flow
    localStorage.setItem("hasRequestedContact", "true")

    if (result.success) {
      setCurrentStep("successStatus")
    } else {
      setCurrentStep("failedStatus")
    }
  }

  // Check if required fields are filled
  const isFormValid = formState.isValid

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

        <div className="flex justify-between items-center gap-1.5">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-base font-semibold">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <div className="h-1 w-20 aspect-20/1 relative bg-neutral-100 rounded-full after:content-[''] after:absolute after:left-0 after:top-0 after:h-full after:w-full after:bg-primary after:rounded-full" />
              <span className="text-sm text-muted-foreground hidden lg:block">
                2/2 {completedLabel}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="bg-border w-px h-3.5" />
              <div className="cursor-pointer size-8 flex items-center justify-center hover:bg-neutral-100 rounded-sm transition-all duration-200" onClick={() => setIsOpen(false)}>
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

        <div className="flex flex-col gap-4 max-h-[330px] overflow-y-auto lg:max-h-none">
          <div className="flex flex-col gap-4">
            <Input fieldProps={contactInfo.organization} control={control} />
            <div className="flex flex-col gap-2 lg:grid grid-cols-2">
              <Input fieldProps={contactInfo.firstName} control={control} rules={{ required: true }} />
              <Input fieldProps={contactInfo.lastName} control={control} rules={{ required: true }} />
              <Input fieldProps={contactInfo.email} control={control} rules={{ required: true }} />
              <Input fieldProps={contactInfo.phoneNumber} control={control} />
            </div>
            <Input fieldProps={contactInfo.additionalInformation} control={control} />
          </div>

          <p className="text-sm text-muted-foreground lg:mb-14">{clarification}</p>
        </div>

        <div className="flex justify-between w-full gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentStep("supportNeeded")}
          >
            {secondaryButtonLabel}
          </Button>
          <Button variant="default" accent disabled={!isFormValid}>
            {isLoading ? loadingButtonLabel : primaryButtonLabel}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ReachOut
