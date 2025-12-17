// Dictionaries
import { getDictionary } from "@/dictionaries/dictionaries"
// Types
import { Locale } from "@/dictionaries/dictionaries"
// Components
import Header from "@/components/common/Header/Header"
import ResultsTopBar from "@/components/custom/ResultsPage/ResultsTopBar/ResultsTopBar"
import Overview from "@/components/custom/ResultsPage/Overview/Overview"
import UnlockNextLevel from "@/components/custom/ResultsPage/UnlockNextLevel/UnlockNextLevel"
import DetailedReport from "@/components/custom/ResultsPage/DetailedReport/DetailedReport"
import CTABanner from "@/components/custom/ResultsPage/CTABanner/CTABanner"
import PrivacyPolicy from "@/components/custom/Homepage/PrivacyPolicy/PrivacyPolicy"

type ResultsPageProps = {
  params: Promise<{ lang: Locale }>
}

const ResultsPage = async ({ params }: ResultsPageProps) => {
  const { lang } = await params
  const dictionary = await getDictionary(lang)
  const {
    header: { stringConnector },
    homepage: { policy },
    results: { topBar, overview, unlockNextLevel, detailedReport, ctaBanner },
  } = dictionary

  return (
    <main className="w-full h-full">
      <Header stringConnector={stringConnector} showBackButton />
      <ResultsTopBar {...topBar} lang={lang} />
      <Overview {...overview} />
      <UnlockNextLevel {...unlockNextLevel} />
      <DetailedReport {...detailedReport} />
      <CTABanner {...ctaBanner} />
      <PrivacyPolicy {...policy} />
    </main>
  )
}

export default ResultsPage
