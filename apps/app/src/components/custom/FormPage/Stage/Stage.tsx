// Types
import { Stage as StageType, StageId } from "@/app/[lang]/form/page"
import { UseFormHandleSubmit, UseFormRegister } from "react-hook-form"
import { DefaultValues } from "@/components/custom/FormPage/Form/default"

export interface StageProps {
  stage: StageType
  handleFinishClick: UseFormHandleSubmit<DefaultValues, DefaultValues>
  register: UseFormRegister<DefaultValues>
  setStage: (stage: StageId) => void
}

const Stage = ({ stage, setStage, handleFinishClick }: StageProps) => {
  console.log({ stage, setStage, handleFinishClick })

  return <div>Stage</div>
}

export default Stage
