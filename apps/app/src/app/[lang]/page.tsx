// Components
import Header from "@/components/common/Header/Header"
import Hero from "@/components/custom/Homepage/Hero/Hero"
import PrivacyPolicy from "@/components/custom/Homepage/PrivacyPolicy/PrivacyPolicy"
import GdprModal from "@/components/custom/Homepage/GdprModal/GdprModal"
import FormRedirectHandler from "@/components/common/FormRedirectHandler/FormRedirectHandler"
// Dictionaries
import { getDictionary, Locale } from "@/dictionaries/dictionaries"

type HomePageProps = {
  params: Promise<{ lang: string }>
}

const HomePage = async ({ params }: HomePageProps) => {
  const { lang: langParam } = await params
  const lang: Locale = (langParam === "en" || langParam === "fr") ? langParam : "en"
  const dictionary = await getDictionary(lang)

  const {
    header: { stringConnector },
    homepage: { hero, policy, gdprModal },
  } = dictionary

  return (
    <main className="w-full flex flex-col items-center justify-between h-full">
      <FormRedirectHandler />
      <Header stringConnector={stringConnector} />
      <Hero {...hero} />
      <PrivacyPolicy {...policy} />
      <GdprModal
        {...gdprModal}
        lang={lang}
        privacyPolicyModal={policy.privacyPolicyModal}
      />
    </main>
  )
}

export default HomePage
