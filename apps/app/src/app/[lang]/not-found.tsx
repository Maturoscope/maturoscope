// Components
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
    notFound
  } = dictionary

  return (
    <main className="w-full flex flex-col items-center justify-between flex-1 min-h-0">
      <div className="flex flex-col items-center justify-center flex-1">
        <NotFound {...notFound} />
      </div>
    </main>
  )
}

export default NotFoundPage

