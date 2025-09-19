// Packages
import Image from "next/image"
// Dictionaries
import { Locale } from "@/dictionaries/dictionaries"
// Components
import LanguageSelect from "@/components/common/LanguageSelect/LanguageSelect"

interface HeaderProps {
  stringConnector: string
  defaultLanguage: Locale
}

const Header = ({ stringConnector, defaultLanguage }: HeaderProps) => {
  return (
    <header className="w-full px-6 h-9 flex items-center justify-between mb-14 max-w-[1280px]">
      <div className="flex items-center gap-2 text-foreground">
        <div className="flex items-center gap-2">
          <Image
            src="/icons/maturoscope.svg"
            alt="Maturoscope"
            width={24}
            height={24}
          />
          <span className="text-sm font-semibold">Maturoscope</span>
        </div>
        <span className="text-sm font-medium">{stringConnector}</span>
        <div className="flex items-center gap-2">
          <Image
            src="/icons/nobatek.svg"
            alt="Nobatek"
            width={24}
            height={24}
          />
        </div>
        <span className="text-sm font-medium">Nobatek</span>
      </div>
      <LanguageSelect defaultLanguage={defaultLanguage} />
    </header>
  )
}

export default Header
