// Actions
import { getOrganizationByKey } from "@/actions/organization"
// Components
import Hero from "@/components/custom/Homepage/Hero/Hero"
// Dictionaries
import { getDictionary, Locale } from "@/dictionaries/dictionaries"

interface HomeProps {
  searchParams: {
    key: string
  }
  params: Promise<{ lang: Locale }>
}

const Home = async ({ searchParams, params }: HomeProps) => {
  const { key } = searchParams
  const { lang } = await params
  const organization = await getOrganizationByKey(key)

  console.log({ organization })

  const dictionary = await getDictionary(lang)

  const {
    homepage: { hero },
  } = dictionary

  return (
    <main className="w-max px-6 flex flex-col items-center justify-center gap-24">
      <Hero {...hero} />
    </main>
  )
}

export default Home
