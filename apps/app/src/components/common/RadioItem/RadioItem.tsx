"use client"

// Packages
import { useController } from "react-hook-form"
// Components
import { CheckedIcon, UncheckedIcon } from "@/components/icons"
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
    <label className="w-full flex items-center justify-start rounded-lg border border-input relative cursor-pointer bg-white">
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
        <div className="absolute top-0 left-0 w-full h-full rounded-[10px] bg-accent/10 border border-accent hidden peer-checked:block" />
        <CheckedIcon
          accent
          className="peer-checked:block hidden relative w-4 h-4"
        />
        <UncheckedIcon className="peer-checked:hidden block relative w-4 h-4" />
        <span className="text-sm font-medium leading-none">{title}</span>
      </div>
    </label>
  )
}

export default RadioItem
