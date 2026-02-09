"use client"

import React from "react"
import { Control, Controller, FieldValues, Path, RegisterOptions } from "react-hook-form"
import { Input as ShadcnInput } from "@/components/ui/input"
import { CountryDropdown } from "./CountrySelect/CountrySelect"
import { Country } from "./CountrySelect/CountrySelect"
import PhoneInput from "./PhoneInput/PhoneInput"
import { TextArea } from "./TextArea/TextArea"
import * as RPNInput from "react-phone-number-input"
import { cn } from "@/lib/utils"

export interface ContactInfoFieldProps {
  name: string
  label: string
  placeholder: string
  type: "text" | "email" | "phone" | "textarea" | "country"
  required?: boolean
  defaultCountry?: string
}

interface InputProps<T extends FieldValues> {
  fieldProps: ContactInfoFieldProps
  control: Control<T>
  rules?: RegisterOptions<T>
  className?: string
  error?: string
}

const Input = <T extends FieldValues>({
  fieldProps,
  control,
  rules,
  className,
  error,
}: InputProps<T>) => {
  const { name, label, placeholder, type, required } = fieldProps

  // For text and email inputs, we can use register
  if (type === "text" || type === "email") {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
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
              className={cn(error && "border-destructive focus-visible:ring-destructive")}
            />
          )}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    )
  }

  // For country select
  if (type === "country") {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
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
    const { defaultCountry } = fieldProps
    return (
      <div className={cn("flex flex-col gap-2", className)}>
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
              defaultCountry={defaultCountry as RPNInput.Country | undefined}
              hasError={!!error}
            />
          )}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    )
  }

  // For textarea
  if (type === "textarea") {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive"> *</span>}
        </label>
        <Controller
          name={name as Path<T>}
          control={control}
          rules={rules}
          render={({ field }) => {
            const currentLength = (field.value ?? "").length
            return (
              <>
                <TextArea
                  id={name}
                  placeholder={placeholder}
                  maxLength={280}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  className={cn("resize-none", className)}
                />
                <p className="text-sm text-muted-foreground w-full text-right">
                  <span className="text-foreground">
                    {currentLength}
                  </span>
                  /280
                </p>
              </>
            )
          }}
        />
      </div>
    )
  }

  return null
}

export default Input
