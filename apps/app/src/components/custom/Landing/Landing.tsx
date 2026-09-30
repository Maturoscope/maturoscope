import { Locale } from "@/lib/locale"
import { getDictionary } from "@/dictionaries/dictionaries"
import { getLandingDictionary } from "@/dictionaries/landing"
import { getPublicOrganizations } from "@/actions/organization"
import Header from "./Header"
import Hero from "./Hero"
import Hosts from "./Hosts"
import WhyMaturoscope from "./WhyMaturoscope"
import WhatWeMeasure from "./WhatWeMeasure"
import WhatYouGet from "./WhatYouGet"
import Contact from "./Contact"
import Footer from "./Footer"

interface LandingProps {
  lang: Locale
}

/**
 * Public marketing landing page shown at the locale root when no organization
 * key is present. Built section by section to match the Figma pixel-perfect.
 */
export default async function Landing({ lang }: LandingProps) {
  const [dict, coreDict, organizations] = await Promise.all([
    getLandingDictionary(lang),
    getDictionary(lang),
    getPublicOrganizations(),
  ])

  return (
    <div className="w-full bg-white text-[#0A0A0A]">
      <Header lang={lang} dict={dict.header} />
      <Hero dict={dict.hero} />
      <WhyMaturoscope dict={dict.whyMaturoscope} />
      <WhatWeMeasure lang={lang} dict={dict.whatWeMeasure} />
      <WhatYouGet dict={dict.whatYouGet} />
      <Hosts
        lang={lang}
        badge={dict.hosts.badge}
        title={dict.hosts.title}
        subtitle={dict.hosts.subtitle}
        selectLabel={dict.hosts.selectLabel}
        organizations={organizations}
      />
      <Contact dict={dict.contact} />
      <Footer
        lang={lang}
        dict={dict.footer}
        nav={dict.header}
        disclaimer={coreDict.homepage.policy.description}
        privacyPolicyModal={coreDict.homepage.policy.privacyPolicyModal}
      />
    </div>
  )
}
