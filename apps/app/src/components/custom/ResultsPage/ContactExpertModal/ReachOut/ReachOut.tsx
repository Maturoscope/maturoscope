"use client"

// Packages
import Image from "next/image"
import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { useParams } from "next/navigation"
import * as RPNInput from "react-phone-number-input"
import { isValidPhoneNumber } from "react-phone-number-input"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
// Components
import Modal from "@/components/common/Modal/Modal"
import { Button } from "@/components/ui/button"
import Input from "@/components/common/Input/Input"
// Context
import { useContactExpertContext } from "@/context/ContactExpertContext"
// Actions
import { generateOrGetCachedPdf, generateReportPdf } from "@/hooks/useDownloadReport"
// Types
import { ModalStep } from "../ContactExpertModal"
import { Locale } from "@/dictionaries/dictionaries"
import { resolveLocale } from "@/lib/locale"

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
    label: "E-mail",
    placeholder: "E-mail",
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

const ES_CONTACT_INFO_FIELDS: ContactInfoForm = {
  organization: { name: "organization", label: "Organización", placeholder: "Organización", type: "text" },
  firstName: { name: "firstName", label: "Nombre", placeholder: "Nombre", type: "text", required: true },
  lastName: { name: "lastName", label: "Apellido", placeholder: "Apellido", type: "text", required: true },
  email: { name: "email", label: "Correo electrónico", placeholder: "Correo electrónico", type: "email", required: true },
  phoneNumber: { name: "phoneNumber", label: "Teléfono", placeholder: "Número de teléfono", type: "phone", defaultCountry: "FR" },
  additionalInformation: { name: "additionalInformation", label: "Información adicional", placeholder: "Comparte cualquier detalle relevante sobre tu proyecto", type: "textarea" },
}

const IT_CONTACT_INFO_FIELDS: ContactInfoForm = {
  organization: { name: "organization", label: "Organizzazione", placeholder: "Organizzazione", type: "text" },
  firstName: { name: "firstName", label: "Nome", placeholder: "Nome", type: "text", required: true },
  lastName: { name: "lastName", label: "Cognome", placeholder: "Cognome", type: "text", required: true },
  email: { name: "email", label: "Email", placeholder: "Email", type: "email", required: true },
  phoneNumber: { name: "phoneNumber", label: "Telefono", placeholder: "Numero di telefono", type: "phone", defaultCountry: "FR" },
  additionalInformation: { name: "additionalInformation", label: "Informazioni aggiuntive", placeholder: "Condividi eventuali dettagli rilevanti sul tuo progetto", type: "textarea" },
}

const SL_CONTACT_INFO_FIELDS: ContactInfoForm = {
  organization: { name: "organization", label: "Organizacija", placeholder: "Organizacija", type: "text" },
  firstName: { name: "firstName", label: "Ime", placeholder: "Ime", type: "text", required: true },
  lastName: { name: "lastName", label: "Priimek", placeholder: "Priimek", type: "text", required: true },
  email: { name: "email", label: "E-pošta", placeholder: "E-pošta", type: "email", required: true },
  phoneNumber: { name: "phoneNumber", label: "Telefon", placeholder: "Telefonska številka", type: "phone", defaultCountry: "FR" },
  additionalInformation: { name: "additionalInformation", label: "Dodatne informacije", placeholder: "Delite morebitne pomembne podrobnosti o svojem projektu", type: "textarea" },
}

const EL_CONTACT_INFO_FIELDS: ContactInfoForm = {
  organization: { name: "organization", label: "Οργανισμός", placeholder: "Οργανισμός", type: "text" },
  firstName: { name: "firstName", label: "Όνομα", placeholder: "Όνομα", type: "text", required: true },
  lastName: { name: "lastName", label: "Επώνυμο", placeholder: "Επώνυμο", type: "text", required: true },
  email: { name: "email", label: "Email", placeholder: "Email", type: "email", required: true },
  phoneNumber: { name: "phoneNumber", label: "Τηλέφωνο", placeholder: "Αριθμός τηλεφώνου", type: "phone", defaultCountry: "FR" },
  additionalInformation: { name: "additionalInformation", label: "Πρόσθετες πληροφορίες", placeholder: "Μοιραστείτε τυχόν σχετικές λεπτομέρειες για το έργο σας", type: "textarea" },
}

const CONTACT_INFO_FIELDS_BY_LANG: Record<string, ContactInfoForm> = {
  en: EN_CONTACT_INFO_FIELDS,
  fr: FR_CONTACT_INFO_FIELDS,
  es: ES_CONTACT_INFO_FIELDS,
  it: IT_CONTACT_INFO_FIELDS,
  sl: SL_CONTACT_INFO_FIELDS,
  el: EL_CONTACT_INFO_FIELDS,
}

const CLARIFICATION_BY_LANG: Record<string, string> = {
  en: "I agree to share my name, email, project details, and questionnaire responses with experts to receive personalized guidance on improving my TRL/MKRL/MFRL level. I understand my data will be used exclusively for this inquiry and will not be stored by the platform.",
  fr: "Je consens à partager mon nom prénom, mon email, le nom de mon projet et les réponses au questionnaire pour recevoir un accompagnement personnalisé et améliorer mes niveaux TRL/MkRL/MfRL. Je comprends que mes données seront utilisées uniquement dans le cadre de cette demande et ne seront pas stockées ou réutilisées par la plateforme.",
  es: "Acepto compartir mi nombre, correo electrónico, detalles del proyecto y respuestas del cuestionario con los expertos para recibir orientación personalizada sobre cómo mejorar mi nivel TRL/MkRL/MfRL. Entiendo que mis datos se usarán exclusivamente para esta consulta y no serán almacenados por la plataforma.",
  it: "Accetto di condividere il mio nome, l'email, i dettagli del progetto e le risposte al questionario con gli esperti per ricevere una guida personalizzata su come migliorare il mio livello TRL/MkRL/MfRL. Comprendo che i miei dati saranno utilizzati esclusivamente per questa richiesta e non saranno conservati dalla piattaforma.",
  sl: "Strinjam se, da svoje ime, e-pošto, podrobnosti projekta in odgovore na vprašalnik delim s strokovnjaki, da prejmem prilagojene nasvete za izboljšanje svoje ravni TRL/MkRL/MfRL. Razumem, da bodo moji podatki uporabljeni izključno za to poizvedbo in jih platforma ne bo shranjevala.",
  el: "Συμφωνώ να μοιραστώ το όνομά μου, το email, τις λεπτομέρειες του έργου και τις απαντήσεις του ερωτηματολογίου με ειδικούς για να λάβω εξατομικευμένη καθοδήγηση σχετικά με τη βελτίωση του επιπέδου μου TRL/MkRL/MfRL. Κατανοώ ότι τα δεδομένα μου θα χρησιμοποιηθούν αποκλειστικά για αυτό το αίτημα και δεν θα αποθηκευτούν από την πλατφόρμα.",
}

const LOADING_BUTTON_LABEL_BY_LANG: Record<string, string> = {
  en: "Loading...",
  fr: "Chargement...",
  es: "Cargando...",
  it: "Caricamento...",
  sl: "Nalaganje...",
  el: "Φόρτωση...",
}

// Validation error messages
const EMAIL_MAX_ERROR_BY_LANG: Record<string, string> = {
  en: "Email must be less than 50 characters",
  fr: "L'email doit contenir moins de 50 caractères",
  es: "El correo debe tener menos de 50 caracteres",
  it: "L'email deve contenere meno di 50 caratteri",
  sl: "E-pošta mora imeti manj kot 50 znakov",
  el: "Το email πρέπει να έχει λιγότερους από 50 χαρακτήρες",
}

const PHONE_INVALID_ERROR_BY_LANG: Record<string, string> = {
  en: "Please enter a valid phone number",
  fr: "Veuillez saisir un numéro de téléphone valide",
  es: "Ingresa un número de teléfono válido",
  it: "Inserisci un numero di telefono valido",
  sl: "Vnesite veljavno telefonsko številko",
  el: "Εισαγάγετε έναν έγκυρο αριθμό τηλεφώνου",
}

// Zod schema for form validation
const createContactFormSchema = (lang: Locale) => z.object({
  organization: z.string().optional(),
  country: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().min(1).max(50, EMAIL_MAX_ERROR_BY_LANG[lang] ?? EMAIL_MAX_ERROR_BY_LANG.en),
  // Optional, but if provided it must be a valid number for the selected region
  // (validated per-region via libphonenumber-js through react-phone-number-input).
  phoneNumber: z
    .string()
    .optional()
    .refine((val) => !val || isValidPhoneNumber(val), {
      message: PHONE_INVALID_ERROR_BY_LANG[lang] ?? PHONE_INVALID_ERROR_BY_LANG.en,
    }),
  additionalInformation: z.string().optional(),
  consent: z.boolean().refine((val) => val === true),
})

type ContactFormSchema = z.infer<ReturnType<typeof createContactFormSchema>>

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
  const [contactInfo, setContactInfo] = useState(
    CONTACT_INFO_FIELDS_BY_LANG[lang] ?? CONTACT_INFO_FIELDS_BY_LANG.en,
  )
  const loadingButtonLabel = LOADING_BUTTON_LABEL_BY_LANG[lang] ?? LOADING_BUTTON_LABEL_BY_LANG.en
  const clarification = CLARIFICATION_BY_LANG[lang] ?? CLARIFICATION_BY_LANG.en

  const onSubmit = async (data: ContactFormSchema) => {
    setContactInformation(data)
    const projectName = localStorage.getItem("projectName")

    setIsLoading(true)

    // Call API directly from the client to avoid Server Action 1MB body limit
    // (the PDF base64 can exceed 1MB when serialised through React Flight protocol)
    const cookieValue = `; ${document.cookie}`
    const parts = cookieValue.split("; organization-key=")
    const organizationKey = parts.length === 2 ? parts.pop()?.split(";").shift() : null

    if (!organizationKey) {
      setIsLoading(false)
      setCurrentStep("failedStatus")
      return
    }

    // The expert/admin PDF must be in the organization's DEFAULT language (not
    // the visitor's). Resolve it, then attach that copy.
    let reportLang: Locale = lang
    try {
      // Client-side call → use the browser-reachable gateway (API_URL is internal).
      const apiBase =
        process.env.NEXT_PUBLIC_GATEWAY_URL || process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${apiBase}/languages/public/${organizationKey}`)
      if (res.ok) {
        const data = await res.json()
        if (data?.defaultLanguage) reportLang = resolveLocale(data.defaultLanguage)
      }
    } catch {
      // Fall back to the visitor's language if the default can't be resolved.
    }

    // Attach the PDF in the org default language. Reuse the visitor's cached PDF
    // only when it already matches; otherwise generate a one-off copy on demand
    // (without touching the cache, so the visitor's download stays instant).
    let reportPdfBase64: string | undefined
    try {
      reportPdfBase64 =
        reportLang === lang
          ? await generateOrGetCachedPdf(lang)
          : await generateReportPdf(reportLang)
    } catch {
      // PDF attachment is best-effort; the email will be sent without it
    }

    try {
      const endpoint = `${process.env.NEXT_PUBLIC_GATEWAY_URL}/services/contact?organizationKey=${organizationKey}`
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gaps: selectedGaps,
          company: data.organization,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          additionalInformation: data.additionalInformation,
          projectName,
          ...(reportPdfBase64 && { reportPdfBase64 }),
        }),
      })

      setIsLoading(false)

      if (response.ok) {
        clearSelections()
        setCurrentStep("successStatus")
      } else {
        setCurrentStep("failedStatus")
      }
    } catch {
      setIsLoading(false)
      setCurrentStep("failedStatus")
    }
  }

  // Progress: 1/2 when form is not valid, 2/2 when all required fields are filled
  // const currentStep = isFormValid ? 2 : 1
  const currentStep = 2
  const totalSteps = 2
  const progressPercentage = (currentStep / totalSteps) * 100

  useEffect(() => {
    setContactInfo(CONTACT_INFO_FIELDS_BY_LANG[lang] ?? CONTACT_INFO_FIELDS_BY_LANG.en)
  }, [lang])

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      closeOnOverlayClick={false}
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
