// Components
import Header from "@/components/common/Header/Header"
import BeforeWeBegin from "@/components/custom/BeforeWeBeginPage/BeforeWeBegin"
// Dictionaries
import { getDictionary, Locale } from "@/dictionaries/dictionaries"

type BeforeWeBeginPageProps = {
  params: Promise<{ lang: string }>
}

const BeforeWeBeginPage = async ({ params }: BeforeWeBeginPageProps) => {
  const { lang: langParam } = await params
  const lang: Locale = langParam === "en" || langParam === "fr" ? langParam : "en"
  const dictionary = await getDictionary(lang)

  const {
    common: { loadingLabel },
    header: { stringConnector },
    beforeWeBegin,
  } = dictionary

  return (
    <main className="w-full flex flex-col items-center justify-start h-full">
      <Header stringConnector={stringConnector} />
      <BeforeWeBegin {...beforeWeBegin} loadingLabel={loadingLabel} />
    </main>
  )
}

export default BeforeWeBeginPage
