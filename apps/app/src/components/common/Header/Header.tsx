"use client"

// Packages
import Image from "next/image"
import { motion } from "motion/react"
// Components
import LanguageSelect from "@/components/common/LanguageSelect/LanguageSelect"
// Animations
import { SIMPLE_FADE_VARIANT } from "@/animations/common"

interface HeaderProps {
  stringConnector: string
}

const Header = ({ stringConnector }: HeaderProps) => {
  return (
    <motion.header
      variants={SIMPLE_FADE_VARIANT}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="w-full px-6 h-9 flex items-center justify-between mb-14 max-w-[1280px]"
    >
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
      <LanguageSelect />
    </motion.header>
  )
}

export default Header
