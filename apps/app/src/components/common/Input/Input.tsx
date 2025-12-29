"use client"

import React from "react"
import { Control, Controller, FieldValues, Path, RegisterOptions } from "react-hook-form"
import { Input as ShadcnInput } from "@/components/ui/input"
import { CountryDropdown } from "./CountrySelect/CountrySelect"
import { Country } from "./CountrySelect/CountrySelect"
import PhoneInput from "./PhoneInput/PhoneInput"
import { TextArea } from "./TextArea/TextArea"
import * as RPNInput from "react-phone-number-input"

export interface ContactInfoFieldProps {
  name: string
  label: string
  placeholder: string
  type: "text" | "email" | "phone" | "textarea" | "country"
  required?: boolean
}

interface InputProps<T extends FieldValues> {
  fieldProps: ContactInfoFieldProps
  control: Control<T>
  rules?: RegisterOptions<T>
}

const Input = <T extends FieldValues>({
  fieldProps,
  control,
  rules,
}: InputProps<T>) => {
  const { name, label, placeholder, type, required } = fieldProps

  // For text and email inputs, we can use register
  if (type === "text" || type === "email") {
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive"> *</span>}
        </label>
        <Controller
          name={name as Path<T>}
          control={control}
          rules={rules}
          render={({ field }) => (
            <ShadcnInput
              id={name}
              type={type}
              placeholder={placeholder}
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
            />
          )}
        />
      </div>
    )
  }

  // For country select
  if (type === "country") {
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive"> *</span>}
        </label>
        <Controller
          name={name as Path<T>}
          control={control}
          rules={rules}
          render={({ field }) => (
            <CountryDropdown
              placeholder={placeholder}
              defaultValue={field.value || undefined}
              onChange={(country: Country) => {
                field.onChange(country.alpha3)
              }}
            />
          )}
        />
      </div>
    )
  }

  // For phone input
  if (type === "phone") {
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive"> *</span>}
        </label>
        <Controller
          name={name as Path<T>}
          control={control}
          rules={rules}
          render={({ field }) => (
            <PhoneInput
              value={(field.value ? field.value : undefined) as RPNInput.Value | undefined}
              onChange={(value) => field.onChange(value || "")}
              placeholder={placeholder}
            />
          )}
        />
      </div>
    )
  }

  // For textarea
  if (type === "textarea") {
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive"> *</span>}
        </label>
        <Controller
          name={name as Path<T>}
          control={control}
          rules={rules}
          render={({ field }) => (
            <TextArea
              id={name}
              placeholder={placeholder}
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
            />
          )}
        />
      </div>
    )
  }

  return null
}

export default Input
