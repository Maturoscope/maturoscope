// Types
import { Locale } from "@/dictionaries/dictionaries"
import { StageId } from "@/components/custom/FormPage/Form/Form"
// Dictionaries
import { getDictionary } from "@/dictionaries/dictionaries"
// Components
import { Suspense } from "react"
import Header from "@/components/common/Header/Header"
import Hero from "@/components/custom/ReviewPage/Hero/Hero"
import AnswersGroup from "@/components/custom/ReviewPage/AnswersGroup/AnswersGroup"
import BackBar from "@/components/common/BackBar/BackBar"
import { ReviewPageWrapper } from "@/components/custom/ReviewPage/ReviewPageWrapper"

interface ReviewPageProps {
  params: Promise<{ lang: string; stage: StageId }>
}

const ReviewPage = async ({ params }: ReviewPageProps) => {
  const { lang: langParam, stage } = await params
  const lang: Locale = (langParam === "en" || langParam === "fr") ? langParam : "en"
  const dictionary = await getDictionary(lang)
  const {
    header: { stringConnector },
    form: { leaveQuestionnaireModal },
    review,
    backBar,
    singleReview,
  } = dictionary

  return (
    <Suspense fallback={null}>
      <ReviewPageWrapper toast={singleReview.toast}>
        <main className="w-full flex flex-col items-center justify-start h-full">
          <Header showBackButton stringConnector={stringConnector} leaveQuestionnaireModal={leaveQuestionnaireModal} />
          <BackBar buttonLabel={backBar.buttonLabel} />
          <Hero {...review} stageName={stage} />
          <AnswersGroup stageName={stage} lang={lang} />
        </main>
      </ReviewPageWrapper>
    </Suspense>
  )
}

export default ReviewPage
