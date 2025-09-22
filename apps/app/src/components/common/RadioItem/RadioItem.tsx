// Packages
import Image from "next/image"
import { Control, useController } from "react-hook-form"
// Types
import { StageId } from "@/components/custom/FormPage/Stage/Stage"
import { DefaultValues } from "@/components/custom/FormPage/Form/default"

export interface RadioItemProps {
  id: string
  title: string
  name: `${StageId}.${string}`
  control: Control<DefaultValues>
  defaultChecked?: boolean
  onClick: () => void
}

const RadioItem = ({
  id,
  title,
  name,
  control,
  defaultChecked,
  onClick,
}: RadioItemProps) => {
  const { field } = useController({ control, name, shouldUnregister: false })

  return (
    <label
      className="w-full flex items-center justify-start rounded-lg border border-input relative cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-start gap-3 w-full relative z-20 -mt-px p-3">
        <input
          type="radio"
          {...field}
          name={name}
          value={id}
          defaultChecked={defaultChecked}
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
