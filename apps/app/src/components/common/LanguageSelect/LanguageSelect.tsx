// Packages
import Image from "next/image"
// Components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
// Dictionaries
import { Locale } from "@/dictionaries/dictionaries"

interface LanguageSelectProps {
  defaultLanguage: Locale
}

const LanguageSelect = ({ defaultLanguage }: LanguageSelectProps) => {
  const placeholder = defaultLanguage.toUpperCase()

  return (
    <div className="w-full max-w-[100px]">
      <Select>
        <SelectTrigger className="justify-center gap-2">
          <div className="flex items-center gap-2 text-sm text-foreground font-medium">
            <Image
              src={`/icons/flag-${defaultLanguage}.svg`}
              alt={placeholder}
              width={16}
              height={16}
            />
            <SelectValue placeholder={placeholder} />
          </div>
        </SelectTrigger>
        <SelectContent className="w-full min-w-[100px] max-w-[100px]">
          <SelectItem value="en">
            <div className="flex items-center gap-2 text-sm text-foreground font-medium">
              <Image
                src={`/icons/flag-en.svg`}
                alt={placeholder}
                width={16}
                height={16}
              />
              <SelectValue placeholder="EN" />
            </div>
          </SelectItem>
          <SelectItem value="fr">
            <div className="flex items-center gap-2 text-sm text-foreground font-medium">
              <Image
                src={`/icons/flag-fr.svg`}
                alt={placeholder}
                width={16}
                height={16}
              />
              <SelectValue placeholder="FR" />
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export default LanguageSelect
