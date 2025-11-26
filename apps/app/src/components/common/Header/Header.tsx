"use client"

// Packages
import Image from "next/image"
import { motion } from "motion/react"
// Components
import LanguageSelect from "@/components/common/LanguageSelect/LanguageSelect"
// Animations
import { SIMPLE_FADE_VARIANT } from "@/animations/common"

export interface HeaderProps {
  stringConnector: string
}

const Header = ({ stringConnector }: HeaderProps) => {
  return (
    <motion.header
      variants={SIMPLE_FADE_VARIANT}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="w-full pl-0.5 pr-4 lg:pl-2 lg:pr-6 h-14 flex items-center justify-between bg-white border border-b border-border shadow-sm"
    >
      <div className="flex items-center gap-2 text-foreground">
        <div className="ml-4">
          <Image
            src="/icons/maturoscope-desktop.svg"
            alt="Maturoscope"
            width={121}
            height={20}
            className="hidden lg:block"
          />
          <Image
            src="/icons/maturoscope-mobile.svg"
            alt="Maturoscope"
            width={20}
            height={14}
            className="block lg:hidden"
          />
        </div>

        <span className="text-sm font-medium">{stringConnector}</span>

        <Image src="/icons/nobatek.svg" alt="Nobatek" width={64} height={20} />
      </div>
      <LanguageSelect />
    </motion.header>
  )
}

export default Header
