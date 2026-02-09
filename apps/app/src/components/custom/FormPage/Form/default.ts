import { StageId } from "@/components/custom/FormPage/Form/Form"

interface Scale {
  scale: "TRL" | "MkRL" | "MfRL"
  questions: Record<string, string>
  comments: Record<string, string>
}

export type DefaultValues = Record<StageId, Scale>

export const DEFAULT_VALUES: DefaultValues = {
  trl: {
    scale: "TRL",
    questions: {
      TRL_Q1: "",
      TRL_Q2: "",
      TRL_Q3: "",
      TRL_Q4: "",
      TRL_Q5: "",
      TRL_Q6: "",
      TRL_Q7: "",
    },
    comments: {
      TRL_Q1: "",
      TRL_Q2: "",
      TRL_Q3: "",
      TRL_Q4: "",
      TRL_Q5: "",
      TRL_Q6: "",
      TRL_Q7: "",
    },
  },
  mkrl: {
    scale: "MkRL",
    questions: {
      MkRL_Q1: "",
      MkRL_Q2: "",
      MkRL_Q3: "",
      MkRL_Q4: "",
    },
    comments: {
      MkRL_Q1: "",
      MkRL_Q2: "",
      MkRL_Q3: "",
      MkRL_Q4: "",
    },
  },
  mfrl: {
    scale: "MfRL",
    questions: {
      MfRL_Q1: "",
      MfRL_Q2: "",
      MfRL_Q3: "",
      MfRL_Q4: "",
    },
    comments: {
      MfRL_Q1: "",
      MfRL_Q2: "",
      MfRL_Q3: "",
      MfRL_Q4: "",
    },
  },
}
