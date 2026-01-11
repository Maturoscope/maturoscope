// Dictionaries
import { getDictionary } from "@/dictionaries/dictionaries"
// Types
import { Locale } from "@/dictionaries/dictionaries"
// Components
import Header from "@/components/common/Header/Header"
import ResultsPageWrapper from "@/components/custom/ResultsPage/ResultsPageWrapper/ResultsPageWrapper"
import ResultsTopBar from "@/components/custom/ResultsPage/ResultsTopBar/ResultsTopBar"
import Overview from "@/components/custom/ResultsPage/Overview/Overview"
import UnlockNextLevel from "@/components/custom/ResultsPage/UnlockNextLevel/UnlockNextLevel"
import DetailedReport from "@/components/custom/ResultsPage/DetailedReport/DetailedReport"
import CTABanner from "@/components/custom/ResultsPage/CTABanner/CTABanner"
import PrivacyPolicy from "@/components/custom/Homepage/PrivacyPolicy/PrivacyPolicy"
import TrackCompletedAssessment from "@/components/common/TrackCompletedAssessment/TrackCompletedAssessment"

type ResultsPageProps = {
  params: Promise<{ lang: string }>
}

const ResultsPage = async ({ params }: ResultsPageProps) => {
  const { lang: langParam } = await params
  const lang: Locale = (langParam === "en" || langParam === "fr") ? langParam : "en"
  const dictionary = await getDictionary(lang)

  const {
    header: { stringConnector },
    results: { beforeYouGoModal },
    homepage: { policy },
    results: { topBar, overview, unlockNextLevel, detailedReport, ctaBanner },
  } = dictionary

  return (
    <main className="w-full h-full">
      <TrackCompletedAssessment />
      <Header stringConnector={stringConnector} showBackButton beforeYouGoModal={beforeYouGoModal} />
      <ResultsPageWrapper dictionary={dictionary}>
        <ResultsTopBar {...topBar} lang={lang} />
        <div className="pt-[195px] lg:pt-[142px]">
          <Overview {...overview} />
          <UnlockNextLevel {...unlockNextLevel} />
          <DetailedReport {...detailedReport} />
          <CTABanner {...ctaBanner} />
          <PrivacyPolicy {...policy} />
        </div>
      </ResultsPageWrapper>
    </main>
  )
}

export default ResultsPage
