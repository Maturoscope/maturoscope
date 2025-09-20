// Actions
import { getOrganizationByKey } from "@/actions/organization"
// Components
import Hero from "@/components/custom/WhyPage/Hero/Hero"
// Dictionaries
import { getDictionary, Locale } from "@/dictionaries/dictionaries"

interface WhyPageProps {
  searchParams: Promise<{ key: string }>
  params: Promise<{ lang: Locale }>
}

const WhyPage = async ({ searchParams, params }: WhyPageProps) => {
  const { key } = await searchParams
  const { lang } = await params
  const dictionary = await getDictionary(lang)
  const organization = await getOrganizationByKey(key)

  console.log({ organization })

  const {
    why: { hero },
  } = dictionary

  return (
    <main className="w-full flex flex-col items-center justify-center mt-14">
      <Hero {...hero} />
    </main>
  )
}

export default WhyPage
