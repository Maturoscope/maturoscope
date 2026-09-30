// Packages
import { headers } from "next/headers"
// Dictionaries
import { getDictionary, resolveLocale } from "@/dictionaries/dictionaries"
// Types
import { Locale } from "@/dictionaries/dictionaries"
// Utils
import { getOrganizationKeyFromCookies } from "@/actions/organization"
import { isStandaloneOrgKey } from "@/lib/standaloneOrg"
// Components
import ResultsPageWrapper from "@/components/custom/ResultsPage/ResultsPageWrapper/ResultsPageWrapper"
import ResultsTopBar from "@/components/custom/ResultsPage/ResultsTopBar/ResultsTopBar"
import Overview from "@/components/custom/ResultsPage/Overview/Overview"
import UnlockNextLevel from "@/components/custom/ResultsPage/UnlockNextLevel/UnlockNextLevel"
import DetailedReport from "@/components/custom/ResultsPage/DetailedReport/DetailedReport"
import CTABanner from "@/components/custom/ResultsPage/CTABanner/CTABanner"
import PrivacyPolicy from "@/components/custom/Homepage/PrivacyPolicy/PrivacyPolicy"
import TrackCompletedAssessment from "@/components/common/TrackCompletedAssessment/TrackCompletedAssessment"
import ResultsRedirectHandler from "@/components/common/ResultsRedirectHandler/ResultsRedirectHandler"
import PdfPreloader from "@/components/common/PdfPreloader/PdfPreloader"
import FadeIn from "@/components/common/FadeIn/FadeIn"

type ResultsPageProps = {
  params: Promise<{ lang: string }>
}

const ResultsPage = async ({ params }: ResultsPageProps) => {
  const { lang: langParam } = await params
  const lang: Locale = resolveLocale(langParam)
  const dictionary = await getDictionary(lang)

  const {
    homepage: { policy },
    results: { topBar, overview, unlockNextLevel, detailedReport, ctaBanner },
  } = dictionary

  // Standalone orgs (e.g. Maturoscope) hide the contact CTA and the next-steps
  // box, and show gaps without services. Resolve the host from the fresh request
  // header (set by middleware) or the cookie.
  const orgKey =
    (await headers()).get("x-organization-key") ??
    (await getOrganizationKeyFromCookies())
  const isStandalone = isStandaloneOrgKey(orgKey)

  return (
    <main className="w-full h-full">
      <ResultsRedirectHandler />
      <TrackCompletedAssessment />
      <PdfPreloader />
      <ResultsPageWrapper dictionary={dictionary}>
        <ResultsTopBar {...topBar} lang={lang} isStandalone={isStandalone} />
        <FadeIn className="pt-[195px] lg:pt-[142px]">
          <Overview {...overview} />
          {!isStandalone && <UnlockNextLevel {...unlockNextLevel} />}
          <DetailedReport {...detailedReport} isStandalone={isStandalone} />
          <CTABanner {...ctaBanner} isStandalone={isStandalone} />
          <PrivacyPolicy {...policy} />
        </FadeIn>
      </ResultsPageWrapper>
    </main>
  )
}

export default ResultsPage
