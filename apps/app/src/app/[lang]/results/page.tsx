// Dictionaries
import { getDictionary } from "@/dictionaries/dictionaries"
// Types
import { Locale } from "@/dictionaries/dictionaries"
// Components
import Header from "@/components/common/Header/Header"
import ResultsTopBar from "@/components/custom/ResultsPage/ResultsTopBar/ResultsTopBar"

type ResultsPageProps = {
  params: Promise<{ lang: Locale }>
}

const ResultsPage = async ({ params }: ResultsPageProps) => {
  const { lang } = await params
  const dictionary = await getDictionary(lang)
  const {
    header: { stringConnector },
    results: { topBar },
  } = dictionary

  return (
    <main className="w-full h-full">
      <Header stringConnector={stringConnector} showBackButton />
      <ResultsTopBar {...topBar} />
    </main>
  )
}

export default ResultsPage
