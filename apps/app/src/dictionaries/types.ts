// Types
import { Locale } from "@/dictionaries/dictionaries"
import { HeaderProps } from "@/components/common/Header/Header"
import { BackToHomeBarProps } from "@/components/common/BackBar/BackBar"
import { HeroProps as HomepageHeroProps } from "@/components/custom/Homepage/Hero/Hero"
import { PrivacyPolicyProps } from "@/components/custom/Homepage/PrivacyPolicy/PrivacyPolicy"
import { SimpleFormProps } from "@/components/custom/BeginPage/SimpleForm/SimpleForm"
import { StageType } from "@/components/custom/FormPage/Form/Form"
import { HeroProps as ReviewHeroProps } from "@/components/custom/ReviewPage/Hero/Hero"
import { QuestionEditorProps } from "@/components/custom/ReviewPage/QuestionEditor/QuestionEditor"
import { ResultsTopBarProps } from "@/components/custom/ResultsPage/ResultsTopBar/ResultsTopBar"
import { OverviewProps } from "@/components/custom/ResultsPage/Overview/Overview"
import { UnlockNextLevelProps } from "@/components/custom/ResultsPage/UnlockNextLevel/UnlockNextLevel"
import { DetailedReportProps } from "@/components/custom/ResultsPage/DetailedReport/DetailedReport"
import { CTABannerProps } from "@/components/custom/ResultsPage/CTABanner/CTABanner"
import { SupportNeededProps } from "@/components/custom/ResultsPage/ContactExpertModal/SupportNeeded/SupportNeeded"
import { ReachOutProps } from "@/components/custom/ResultsPage/ContactExpertModal/ReachOut/ReachOut"
import { StatusProps } from "@/components/custom/ResultsPage/ContactExpertModal/Status/Status"
import { BeforeYouGoModalProps } from "@/components/custom/ResultsPage/BeforeYouGoModal/BeforeYouGoModal"
import { LeaveQuestionnaireModalProps } from "@/components/custom/FormPage/LeaveQuestionnaireModal/LeaveQuestionnaireModal"

type DictionaryStage = Omit<StageType, "questions">

export type Dictionary = {
  lang: Locale
  header: HeaderProps
  backBar: BackToHomeBarProps
  homepage: {
    hero: HomepageHeroProps
    policy: PrivacyPolicyProps
  }
  begin: SimpleFormProps
  form: {
    buttonNextLabel: string
    buttonPrevLabel: string
    commentPlaceholder: string
    stages: DictionaryStage[]
    leaveQuestionnaireModal: LeaveQuestionnaireModalProps
    checkpoint: {
      buttonLabel: string
    },
  }
  review: ReviewHeroProps
  singleReview: Pick<
    QuestionEditorProps,
    "saveButtonLabel" | "cancelButtonLabel" | "commentPlaceholder"
  >
  results: {
    topBar: Omit<ResultsTopBarProps, "lang">
    beforeYouGoModal: BeforeYouGoModalProps
    overview: OverviewProps
    unlockNextLevel: UnlockNextLevelProps
    detailedReport: DetailedReportProps
    ctaBanner: CTABannerProps
    contactExpertModal: {
      supportNeeded: SupportNeededProps
      reachOut: Omit<ReachOutProps, "fields" | "clarification">
      successStatus: StatusProps
      failedStatus: StatusProps
    }
  }
}
