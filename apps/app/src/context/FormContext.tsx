"use client"

// Packages
import { createContext, useContext, useEffect } from "react"
import { useForm, UseFormGetValues, Control } from "react-hook-form"
// Types
import { DefaultValues } from "@/components/custom/FormPage/Form/default"
// Utils
import { DEFAULT_VALUES } from "@/components/custom/FormPage/Form/default"

interface FormContextType {
  control: Control<DefaultValues>
  getValues: UseFormGetValues<DefaultValues>
}

interface FormProviderProps {
  children: React.ReactNode
}

const FormContext = createContext<FormContextType | null>(null)

export const FormProvider = ({ children }: FormProviderProps) => {
  const { control, reset, getValues } = useForm<DefaultValues>({
    defaultValues: DEFAULT_VALUES,
  })

  useEffect(() => {
    const savedForm = JSON.parse(localStorage.getItem("form") || "{}")
    if (!savedForm) return
    reset(savedForm)

    // const { lastSavedStage } = calcCheckpoint(savedForm) || {}
    // console.log({ lastSavedStage })
    // if (!lastSavedStage) return
    // setCurrStageId(lastSavedStage)
  }, [reset])

  return (
    <FormContext.Provider value={{ control, getValues }}>
      {children}
    </FormContext.Provider>
  )
}

export const useFormContext = () => useContext(FormContext) as FormContextType
