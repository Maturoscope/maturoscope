// Components
import Header from "@/components/common/Header/Header"
// Dictionaries
import { getDictionary } from "@/dictionaries/dictionaries"
// Types
import { Locale } from "@/dictionaries/dictionaries"

type NotFoundPageProps = {
  params: Promise<{ lang: Locale }>
}

const NotFoundPage = async ({ params }: NotFoundPageProps) => {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  const {
    header: { stringConnector },
  } = dictionary

  return (
    <main className="w-full flex flex-col items-center justify-between h-full">
      <Header stringConnector={stringConnector} />
      <div className="flex flex-col items-center justify-center flex-1">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-lg text-muted-foreground">Page not found</p>
      </div>
    </main>
  )
}

export default NotFoundPage

