import { StageId } from "@/app/[lang]/form/page"

export type DefaultValues = Record<StageId, Record<string, string>>

export const DEFAULT_VALUES: DefaultValues = {
  trl: {
    trl1: "",
    trl2: "",
    trl3: "",
    trl4: "",
    trl5: "",
    trl6: "",
    trl7: "",
  },
  mkrl: {
    mkrl1: "",
    mkrl2: "",
    mkrl3: "",
    mkrl4: "",
    mkrl5: "",
    mkrl6: "",
    mkrl7: "",
  },
  mfrl: {
    mfrl1: "",
    mfrl2: "",
    mfrl3: "",
    mfrl4: "",
    mfrl5: "",
    mfrl6: "",
    mfrl7: "",
  },
}
