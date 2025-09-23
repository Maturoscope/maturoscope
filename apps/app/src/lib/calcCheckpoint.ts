// Types
import { StageId } from "@/components/custom/FormPage/Form/Form"
import { DefaultValues } from "@/components/custom/FormPage/Form/default"

export const calcCheckpoint = (defaultValues: DefaultValues) => {
  const stagesOrdered: StageId[] = ["trl", "mkrl", "mfrl"]
  const orderedStages = stagesOrdered.map(
    (stageId) => defaultValues[stageId as StageId]
  )
  let checkpoint: {
    lastSavedStage: StageId
    lastSavedQuestion: string
  } | null = null

  for (let i = 0; i < orderedStages.length; i++) {
    const stage = orderedStages[i]
    const stageId = stagesOrdered[i]

    for (const question of Object.keys(stage)) {
      console.log({ stageId, stage, question })
      if (!stage[question]) {
        checkpoint = { lastSavedStage: stageId, lastSavedQuestion: question }
        return checkpoint
      }
    }
  }

  return checkpoint
}
