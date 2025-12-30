// Components
import Header from "@/components/common/Header/Header"
import Hero from "@/components/custom/Homepage/Hero/Hero"
import PrivacyPolicy from "@/components/custom/Homepage/PrivacyPolicy/PrivacyPolicy"
import OrganizationKeyHandler from "@/components/common/OrganizationKeyHandler/OrganizationKeyHandler"
import FormRedirectHandler from "@/components/common/FormRedirectHandler/FormRedirectHandler"
// Dictionaries
import { getDictionary, Locale } from "@/dictionaries/dictionaries"

type HomePageProps = {
  params: Promise<{ lang: Locale }>
}

const HomePage = async ({ params }: HomePageProps) => {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  const {
    header: { stringConnector },
    homepage: { hero, policy },
  } = dictionary

  return (
    <main className="w-full flex flex-col items-center justify-between h-full">
      <FormRedirectHandler />
      <OrganizationKeyHandler />
      <Header stringConnector={stringConnector} />
      <Hero {...hero} />
      <PrivacyPolicy {...policy} />
    </main>
  )
}

export default HomePage
