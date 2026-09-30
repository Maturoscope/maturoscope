// Components
import Hero from "@/components/custom/Homepage/Hero/Hero"
import PrivacyPolicy from "@/components/custom/Homepage/PrivacyPolicy/PrivacyPolicy"
import GdprModal from "@/components/custom/Homepage/GdprModal/GdprModal"
import FormRedirectHandler from "@/components/common/FormRedirectHandler/FormRedirectHandler"
import Landing from "@/components/custom/Landing/Landing"
// Dictionaries
import { getDictionary, Locale, resolveLocale } from "@/dictionaries/dictionaries"

type HomePageProps = {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ key?: string }>
}

const HomePage = async ({ params, searchParams }: HomePageProps) => {
  const { lang: langParam } = await params
  const { key } = await searchParams
  const lang: Locale = resolveLocale(langParam)

  // No organization key → public marketing landing page.
  if (!key) {
    return <Landing lang={lang} />
  }

  const dictionary = await getDictionary(lang)

  const {
    common: { loadingLabel },
    homepage: { hero, policy, gdprModal },
  } = dictionary

  // Add loadingLabel to information props
  const heroWithLoading = {
    ...hero,
    information: { ...hero.information, loadingLabel },
  }

  return (
    <main className="w-full flex flex-col items-center flex-1 min-h-0">
      <FormRedirectHandler />
      <div className="w-full flex-1 flex items-center justify-center">
        <Hero {...heroWithLoading} />
      </div>
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
