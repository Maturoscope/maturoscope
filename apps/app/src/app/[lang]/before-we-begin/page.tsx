// Components
import BeforeWeBegin from "@/components/custom/BeforeWeBeginPage/BeforeWeBegin"
// Dictionaries
import { getDictionary, Locale, resolveLocale } from "@/dictionaries/dictionaries"

type BeforeWeBeginPageProps = {
  params: Promise<{ lang: string }>
}

const BeforeWeBeginPage = async ({ params }: BeforeWeBeginPageProps) => {
  const { lang: langParam } = await params
  const lang: Locale = resolveLocale(langParam)
  const dictionary = await getDictionary(lang)

  const {
    common: { loadingLabel },
    beforeWeBegin,
  } = dictionary

  return (
    <main className="w-full flex flex-col items-center justify-start flex-1 min-h-0">
      <BeforeWeBegin {...beforeWeBegin} loadingLabel={loadingLabel} />
    </main>
  )
}

export default BeforeWeBeginPage
