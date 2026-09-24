import type { StaticImageData } from "next/image";

// Icons
import ENIcon from "../../../public/icons/EN.svg";
import FRIcon from "../../../public/icons/FR.svg";
import ESIcon from "../../../public/icons/ES.svg";
import ITIcon from "../../../public/icons/IT.svg";
import SLIcon from "../../../public/icons/SL.svg";
import ELIcon from "../../../public/icons/EL.svg";

interface Section {
  key: string;
  label: string;
  src: StaticImageData;
}

export const LANGUAGES: Section[] = [
  { key: "TITLE", label: "TITLE", src: ENIcon },
  { key: "EN", label: "ENGLISH", src: ENIcon },
  { key: "FR", label: "FRENCH", src: FRIcon },
  { key: "ES", label: "SPANISH", src: ESIcon },
  { key: "IT", label: "ITALIAN", src: ITIcon },
  { key: "SL", label: "SLOVENIAN", src: SLIcon },
  { key: "EL", label: "GREEK", src: ELIcon },
];
