// Packages
import Image from "next/image"
import { Control, useController } from "react-hook-form"
// Components
import { DefaultValues } from "@/components/custom/FormPage/Form/default"
// Types
import { StageId } from "@/components/custom/FormPage/Stage/Stage"

export interface RadioItemProps {
  id: string
  title: string
  name: `${StageId}.${string}`
  control: Control<DefaultValues>
  value?: string
}

const RadioItem = ({ id, title, name, control, value }: RadioItemProps) => {
  const { field } = useController({ control, name })

  return (
    <label className="w-full flex items-center justify-start gap-3 p-3 rounded-lg border border-input relative cursor-pointer">
      <input
        type="radio"
        {...field}
        name={name}
        value={value ?? id}
        className="peer appearance-none outline-none relative"
      />
      <div className="absolute top-0 left-0 w-full h-full rounded-lg bg-primary/10 border border-primary hidden peer-checked:block" />
      <Image
        src="/icons/form/checked.svg"
        alt="Radio checked"
        width={16}
        height={16}
        className="peer-checked:block hidden relative z-20"
      />
      <Image
        src="/icons/form/unchecked.svg"
        alt="Radio unchecked"
        width={16}
        height={16}
        className="peer-checked:hidden block"
      />
      <span className="text-sm font-medium leading-none">{title}</span>
    </label>
  )
}

export default RadioItem
