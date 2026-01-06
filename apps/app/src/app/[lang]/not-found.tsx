// Components
import Header from "@/components/common/Header/Header"
import NotFound from "@/components/custom/NotFoundPage/NotFound/NotFound"
// Dictionaries
import { getDictionary, DEFAULT_LANGUAGE } from "@/dictionaries/dictionaries"
// Types
import { Locale } from "@/dictionaries/dictionaries"

type NotFoundPageProps = {
  params?: Promise<{ lang?: Locale }>
}

const NotFoundPage = async ({ params }: NotFoundPageProps) => {
  const resolvedParams = await params
  const lang = resolvedParams?.lang || DEFAULT_LANGUAGE
  const dictionary = await getDictionary(lang)

  const {
    header: { stringConnector },
    notFound
  } = dictionary

  return (
    <main className="w-full flex flex-col items-center justify-between h-full">
      <Header stringConnector={stringConnector} />
      <div className="flex flex-col items-center justify-center flex-1">
        <NotFound {...notFound} />
      </div>
    </main>
  )
}

export default NotFoundPage

