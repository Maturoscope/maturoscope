// Dictionaries
import { getDictionary } from "@/dictionaries/dictionaries"
// Types
import { Locale } from "@/dictionaries/dictionaries"
// Components
import Header from "@/components/common/Header/Header"
import ResultsTopBar from "@/components/custom/ResultsPage/ResultsTopBar/ResultsTopBar"
import Overview from "@/components/custom/ResultsPage/Overview/Overview"
import UnlockNextLevel from "@/components/custom/ResultsPage/UnlockNextLevel/UnlockNextLevel"
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
    results: { topBar, overview, unlockNextLevel, ctaBanner },
  } = dictionary

  return (
    <main className="w-full h-full">
      <Header stringConnector={stringConnector} showBackButton />
      <ResultsTopBar {...topBar} />
      <Overview {...overview} />
      <UnlockNextLevel {...unlockNextLevel} />
      <CTABanner {...ctaBanner} />
      <PrivacyPolicy {...policy} />
    </main>
  )
}

export default ResultsPage
