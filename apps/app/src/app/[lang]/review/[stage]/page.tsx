// Types
import { Locale } from "@/dictionaries/dictionaries"
import { StageId } from "@/components/custom/FormPage/Form/Form"
// Dictionaries
import { getDictionary } from "@/dictionaries/dictionaries"
// Components
import Header from "@/components/common/Header/Header"
import Hero from "@/components/custom/ReviewPage/Hero/Hero"
import AnswersGroup from "@/components/custom/ReviewPage/AnswersGroup/AnswersGroup"
import BackToHomeBar from "@/components/common/BackToHomeBar/BackToHomeBar"

interface ReviewPageProps {
  params: Promise<{ lang: Locale; stage: StageId }>
}

const ReviewPage = async ({ params }: ReviewPageProps) => {
  const { lang, stage } = await params
  const dictionary = await getDictionary(lang)
  const {
    header: { stringConnector },
    review,
    backBar,
  } = dictionary

  return (
    <main className="w-full flex flex-col items-center justify-start h-full">
      <Header showBackButton stringConnector={stringConnector} />
      <BackToHomeBar buttonLabel={backBar.buttonLabel} />
      <Hero {...review} stageName={stage} />
      <AnswersGroup stageName={stage} lang={lang} />
    </main>
  )
}

export default ReviewPage
