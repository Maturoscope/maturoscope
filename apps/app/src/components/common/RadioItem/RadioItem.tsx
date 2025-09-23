"use client"

// Packages
import Image from "next/image"
import { useController } from "react-hook-form"
// Context
import { useFormContext } from "@/context/FormContext"
// Types
import { StageId } from "@/components/custom/FormPage/Form/Form"

export interface RadioItemProps {
  id: string
  title: string
  name: `${StageId}.${string}`
  onClick: () => void
}

const RadioItem = ({ id, title, name, onClick }: RadioItemProps) => {
  const { control } = useFormContext()
  const { field } = useController({ control, name })
  const isChecked = field.value === id

  const handleChange = () => {
    field.onChange(id)
    onClick()
  }

  return (
    <label className="w-full flex items-center justify-start rounded-lg border border-input relative cursor-pointer">
      <div className="flex items-start justify-start gap-3 w-full relative z-20 -mt-px p-3">
        <input
          type="radio"
          {...field}
          onChange={handleChange}
          name={name}
          value={id}
          checked={isChecked}
          className="peer appearance-none absolute outline-none"
        />
        <div className="absolute top-0 left-0 w-full h-full rounded-[10px] bg-primary/10 border border-primary hidden peer-checked:block" />
        <Image
          src="/icons/form/checked.svg"
          alt="Radio checked"
          width={16}
          height={16}
          className="peer-checked:block hidden relative"
        />
        <Image
          src="/icons/form/unchecked.svg"
          alt="Radio unchecked"
          width={16}
          height={16}
          className="peer-checked:hidden block relative"
        />
        <span className="text-sm font-medium leading-none">{title}</span>
      </div>
    </label>
  )
}

export default RadioItem
