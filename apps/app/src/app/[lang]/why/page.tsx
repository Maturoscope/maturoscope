// Actions
import { getOrganizationByKey } from "@/actions/organization"
// Components
import Hero from "@/components/custom/Why/Hero/Hero"
// Dictionaries
import { getDictionary, Locale } from "@/dictionaries/dictionaries"

interface HomeProps {
  searchParams: {
    key: string
  }
  params: Promise<{ lang: Locale }>
}

const Why = async ({ searchParams, params }: HomeProps) => {
  const { key } = searchParams
  const { lang } = await params
  const organization = await getOrganizationByKey(key)

  console.log({ organization })

  const dictionary = await getDictionary(lang)

  const {
    why: { hero },
  } = dictionary

  return (
    <main className="w-full flex flex-col items-center justify-center">
      <Hero {...hero} />
    </main>
  )
}

export default Why
