import type { StaticImageData } from "next/image";

// Icons
import ENIcon from "../../../public/icons/EN.svg";
import FRIcon from "../../../public/icons/FR.svg";

interface Section {
  key: string;
  label: string;
  src: StaticImageData;
}

export const LANGUAGES: Section[] = [
  { key: "TITLE", label: "TITLE", src: ENIcon },
  { key: "EN", label: "ENGLISH", src: ENIcon },
  { key: "FR", label: "FRENCH", src: FRIcon },
];
