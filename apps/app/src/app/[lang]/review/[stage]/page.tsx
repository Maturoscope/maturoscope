// Types
import { Locale } from "@/dictionaries/dictionaries"
import { StageId } from "@/components/custom/FormPage/Form/Form"
// Dictionaries
import { getDictionary } from "@/dictionaries/dictionaries"
// Components
import { Suspense } from "react"
import Hero from "@/components/custom/ReviewPage/Hero/Hero"
import AnswersGroup from "@/components/custom/ReviewPage/AnswersGroup/AnswersGroup"
import BackBar from "@/components/common/BackBar/BackBar"
import { ReviewPageWrapper } from "@/components/custom/ReviewPage/ReviewPageWrapper"
import ReviewStageGuard from "@/components/common/ReviewStageGuard/ReviewStageGuard"

interface ReviewPageProps {
  params: Promise<{ lang: string; stage: StageId }>
}

const ReviewPage = async ({ params }: ReviewPageProps) => {
  const { lang: langParam, stage } = await params
  const lang: Locale = (langParam === "en" || langParam === "fr") ? langParam : "en"
  const dictionary = await getDictionary(lang)
  const {
    common: { loadingLabel, notApplicableLabel },
    review,
    backBar,
    singleReview,
  } = dictionary

  return (
    <Suspense fallback={null}>
      <ReviewPageWrapper toast={singleReview.toast}>
        <ReviewStageGuard stage={stage} lang={lang} />
        <main className="w-full flex flex-col items-center justify-start flex-1 min-h-0">
          <BackBar buttonLabel={backBar.buttonLabel} loadingLabel={loadingLabel} />
          <Hero {...review} stageName={stage} />
          <AnswersGroup
            stageName={stage}
            lang={lang}
            notApplicableLabel={notApplicableLabel}
          />
        </main>
      </ReviewPageWrapper>
    </Suspense>
  )
}

export default ReviewPage
