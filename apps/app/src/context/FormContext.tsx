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
    if (!savedForm || Object.keys(savedForm).length === 0) return

    // Ensure backward compatibility: add comments if they don't exist
    const formWithComments = (
      Object.keys(DEFAULT_VALUES) as Array<keyof typeof DEFAULT_VALUES>
    ).reduce((acc, stageId) => {
      const stage = savedForm[stageId] || DEFAULT_VALUES[stageId]
      const defaultStage = DEFAULT_VALUES[stageId]

      acc[stageId] = {
        ...stage,
        comments: stage?.comments || defaultStage.comments,
      }
      return acc
    }, {} as DefaultValues)

    reset(formWithComments)
  }, [reset])

  return (
    <FormContext.Provider value={{ control, getValues }}>
      {children}
    </FormContext.Provider>
  )
}

export const useFormContext = () => useContext(FormContext) as FormContextType
