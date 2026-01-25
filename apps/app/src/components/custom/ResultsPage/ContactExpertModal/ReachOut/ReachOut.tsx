"use client"

// Packages
import Image from "next/image"
import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { useParams } from "next/navigation"
import * as RPNInput from "react-phone-number-input"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
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
  defaultCountry?: string,
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
  consent: boolean
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
    defaultCountry: "FR",
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
    defaultCountry: "FR",
  },
  additionalInformation: {
    name: "additionalInformation",
    label: "Informations supplémentaires",
    placeholder: "Partagez toutes les informations pertinentes sur votre projet",
    type: "textarea",
  },
}

const EN_CLARIFICATION = "I agree to share my name, email, project details, and questionnaire responses with experts to receive personalized guidance on improving my TRL/MKRL/MFRL level. I understand my data will be used exclusively for this inquiry and will not be stored by the platform."
const EN_LOADING_BUTTON_LABEL = "Loading..."
const FR_CLARIFICATION = "Je consens à partager mon nom, mon email, les détails de mon projet, et les réponses du questionnaire avec des experts pour recevoir une guidance personnalisée sur l'amélioration de mon niveau TRL/MkRL/MfRL. Je comprends que mes données seront utilisées exclusivement pour cette demande et ne seront pas stockées par la plateforme."
const FR_LOADING_BUTTON_LABEL = "Chargement..."

// Validation error messages
const EN_EMAIL_MAX_ERROR = "Email must be less than 50 characters"
const FR_EMAIL_MAX_ERROR = "L'email doit contenir moins de 50 caractères"
const EN_PHONE_MAX_ERROR = "Phone must be less than 15 characters"
const FR_PHONE_MAX_ERROR = "Le téléphone doit contenir moins de 15 caractères"

// Zod schema for form validation
const createContactFormSchema = (lang: Locale) => z.object({
  organization: z.string().optional(),
  country: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().min(1).max(50, lang === "en" ? EN_EMAIL_MAX_ERROR : FR_EMAIL_MAX_ERROR),
  phoneNumber: z.string().max(15, lang === "en" ? EN_PHONE_MAX_ERROR : FR_PHONE_MAX_ERROR).optional().or(z.literal("")),
  additionalInformation: z.string().optional(),
  consent: z.boolean().refine((val) => val === true),
})

type ContactFormSchema = z.infer<ReturnType<typeof createContactFormSchema>>

/**
 * Removes duplicate country code from phone number if present.
 * Example: "+54+543512425044" -> "+543512425044"
 * Handles patterns like: +XX+XX... where XX is a country code (1-3 digits)
 */
const removeDuplicateCountryCode = (phoneNumber: string): string => {
  if (!phoneNumber || !phoneNumber.startsWith("+")) {
    return phoneNumber
  }

  // Check if phone number contains multiple "+" signs (indicating possible duplicate)
  const plusCount = (phoneNumber.match(/\+/g) || []).length
  if (plusCount < 2) {
    return phoneNumber
  }

  // Pattern to detect duplicate country codes: +XX+XX... where XX is 1-3 digits
  // This matches cases like: +54+543512425044, +1+1234567890, etc.
  const duplicatePattern = /^\+(\d{1,3})\+\1(\d+)/
  const match = phoneNumber.match(duplicatePattern)

  if (match) {
    // Found duplicate country code, remove the first occurrence
    // match[1] is the country code, match[2] is the rest of the number
    return `+${match[1]}${match[2]}`
  }

  // Also check for pattern where there might be extra characters between duplicates
  // Pattern: +XX+XX... (with possible spacing or formatting)
  const looseDuplicatePattern = /^\+(\d{1,3})\+(\d*)\1(\d+)/
  const looseMatch = phoneNumber.match(looseDuplicatePattern)

  if (looseMatch && looseMatch[2].length === 0) {
    // Found duplicate with no characters in between
    return `+${looseMatch[1]}${looseMatch[3]}`
  }

  return phoneNumber
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
  const [isLoading, setIsLoading] = useState(false)
  const { setContactInformation, selectedGaps, clearSelections } = useContactExpertContext()
  const { lang } = useParams<{ lang: Locale }>()
  const { control, handleSubmit, formState } = useForm<ContactFormSchema>({
    mode: "onChange",
    resolver: zodResolver(createContactFormSchema(lang)),
    defaultValues: {
      organization: "",
      // country: "",
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      additionalInformation: "",
      consent: false,
    },
  })
  const [contactInfo, setContactInfo] = useState(EN_CONTACT_INFO_FIELDS)
  const loadingButtonLabel = lang === "en" ? EN_LOADING_BUTTON_LABEL : FR_LOADING_BUTTON_LABEL
  const clarification = lang === "en" ? EN_CLARIFICATION : FR_CLARIFICATION

  const onSubmit = async (data: ContactFormSchema) => {
    // Clean phone number to remove duplicate country codes if present
    const cleanedData = {
      ...data,
      phoneNumber: data.phoneNumber ? removeDuplicateCountryCode(data.phoneNumber) : data.phoneNumber,
    }

    setContactInformation(cleanedData)
    const projectName = localStorage.getItem("projectName")

    setIsLoading(true)
    const result = await requestContact({
      gaps: selectedGaps,
      contactInformation: cleanedData,
      projectName: projectName as string,
    })
    setIsLoading(false)

    if (result.success) {
      clearSelections()
      setCurrentStep("successStatus")
    } else {
      setCurrentStep("failedStatus")
    }
  }

  // Progress: 1/2 when form is not valid, 2/2 when all required fields are filled
  // const currentStep = isFormValid ? 2 : 1
  const currentStep = 2
  const totalSteps = 2
  const progressPercentage = (currentStep / totalSteps) * 100

  useEffect(() => {
    setContactInfo(lang === "en" ? EN_CONTACT_INFO_FIELDS : FR_CONTACT_INFO_FIELDS)
  }, [lang])

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      className="p-6 max-w-[740px] w-full h-[650px]"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col justify-between gap-4 h-full">
        <div className="flex flex-col gap-4 flex-1 min-h-0">
          <div className="flex justify-between items-start lg:items-center gap-1.5 lg:gap-4 shrink-0">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-base font-semibold">{title}</h1>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <div className="h-1 w-20 aspect-20/1 relative bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-accent rounded-full transition-all duration-200"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground hidden lg:block whitespace-nowrap">
                  {currentStep}/{totalSteps} {completedLabel}
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

          <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto lg:overflow-y-hidden">
            <div className="flex flex-col gap-4">
              <Input fieldProps={contactInfo.organization} control={control} />
              <div className="flex flex-col gap-2 lg:grid grid-cols-2">
                <Input fieldProps={contactInfo.firstName} control={control} />
                <Input fieldProps={contactInfo.lastName} control={control} />
                <Input fieldProps={contactInfo.email} control={control} error={formState.errors.email?.message} />
                <Input fieldProps={contactInfo.phoneNumber} control={control} error={formState.errors.phoneNumber?.message} />
              </div>
              <Input fieldProps={contactInfo.additionalInformation} control={control} />
            </div>

            <Controller
              control={control}
              name="consent"
              rules={{ required: true }}
              render={({ field }) => (
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="peer appearance-none absolute outline-none"
                  />
                  <Image
                    src="/icons/common/checkbox-unchecked.svg"
                    alt="Checkbox"
                    width={16}
                    height={16}
                    className="peer-checked:hidden mt-0.5 shrink-0"
                  />
                  <Image
                    src="/icons/common/checkbox-checked.svg"
                    alt="Checkbox"
                    width={16}
                    height={16}
                    className="hidden peer-checked:block mt-0.5 shrink-0"
                  />
                  <p className="text-sm text-muted-foreground lg:mb-14">{clarification}</p>
                </label>
              )}
            />
          </div>
        </div>

        <div className="flex justify-between w-full gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={() => setCurrentStep("supportNeeded")}
          >
            {secondaryButtonLabel}
          </Button>
          <Button variant="default" accent disabled={!formState.isValid || isLoading}>
            {isLoading ? loadingButtonLabel : primaryButtonLabel}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ReachOut
