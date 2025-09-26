// Types
import { StageId } from "@/components/custom/FormPage/Form/Form"
import { DefaultValues } from "@/components/custom/FormPage/Form/default"

export const calcCheckpoint = (defaultValues: DefaultValues) => {
  const defaultValuesAreEmpty = Object.keys(defaultValues).length === 0
  if (defaultValuesAreEmpty) return null

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
    const questionsId = Object.keys(stage) || []

    for (let j = 0; j < questionsId.length; j++) {
      const question = questionsId[j]
      const isLastQuestionAndLastStage =
        i === orderedStages.length - 1 && j === questionsId.length - 1
      const questionIsNotFilled = !stage[question]

      if (questionIsNotFilled) {
        const isFirstQuestionNotFilled = j === 0

        if (isFirstQuestionNotFilled) {
          const prevStage = stagesOrdered[i - 1]
          const lastQuestionIdOfPrevStage = Object.keys(orderedStages[i - 1])[
            Object.keys(orderedStages[i - 1]).length - 1
          ]

          checkpoint = {
            lastSavedStage: prevStage,
            lastSavedQuestion: lastQuestionIdOfPrevStage,
          }
        } else {
          checkpoint = {
            lastSavedStage: stageId,
            lastSavedQuestion: question,
          }
        }

        return checkpoint
      }

      if (isLastQuestionAndLastStage) {
        checkpoint = { lastSavedStage: stageId, lastSavedQuestion: question }
        return checkpoint
      }
    }
  }

  return checkpoint
}
