"use client"

// Packages
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
// Animations
import { SIMPLE_FADE_VARIANT } from "@/animations/common"
// Types
import { Locale } from "@/dictionaries/dictionaries"
// Content
import { privacyPolicyEn, privacyPolicyFr } from "./content"

export interface PrivacyPolicyModalProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  lang: Locale
  title: string
  lastUpdatedLabel: string
}

const PrivacyPolicyModal = ({ isOpen, setIsOpen, lang, title, lastUpdatedLabel }: PrivacyPolicyModalProps) => {
  const content = lang === "fr" ? privacyPolicyFr : privacyPolicyEn

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) =>
    e.stopPropagation()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={SIMPLE_FADE_VARIANT}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.2 }}
          onClick={() => setIsOpen(false)}
          className="w-full h-full fixed top-0 left-0 bg-black/40 z-60 flex items-center justify-center p-6 lg:p-0"
        >
          <div
            onClick={handleClick}
            className="bg-white rounded-lg w-[calc(100dvw-48px)] h-[calc(100dvh-70px)] lg:w-[975px] lg:h-[700px] flex flex-col"
          >
            {/* Header with title and close button */}
            <div className="flex justify-between items-start p-6 pb-4 shrink-0">
              <div className="flex flex-col gap-1">
                <h1 className="text-xl font-bold">{title}</h1>
                <p className="text-sm text-muted-foreground">{lastUpdatedLabel}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="cursor-pointer size-8 flex items-center justify-center hover:bg-neutral-100 rounded-sm transition-all duration-200 bg-transparent border-none p-0"
              >
                <Image
                  src="/icons/common/cross.svg"
                  alt="Close"
                  width={16}
                  height={16}
                />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-hidden px-6 pb-6">
              <div className="h-full overflow-y-auto custom-scrollbar pr-4">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Links open in new tab
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        {children}
                      </a>
                    ),
                    // Headers
                    h1: ({ children }) => (
                      <h1 className="text-xl font-bold mb-4">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-lg font-bold mt-6 mb-3">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-base font-semibold mt-4 mb-2">{children}</h3>
                    ),
                    // Paragraphs
                    p: ({ children }) => (
                      <p className="text-sm text-foreground mb-3 leading-relaxed">{children}</p>
                    ),
                    // Lists
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside text-sm mb-3 space-y-1">{children}</ul>
                    ),
                    li: ({ children }) => (
                      <li className="text-sm text-foreground">{children}</li>
                    ),
                    // Tables
                    table: ({ children }) => (
                      <div className="overflow-x-auto mb-4">
                        <table className="w-full text-sm border-collapse border border-border">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-neutral-100">{children}</thead>
                    ),
                    th: ({ children }) => (
                      <th className="border border-border px-3 py-2 text-left font-semibold">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="border border-border px-3 py-2">{children}</td>
                    ),
                    // Strong/Bold
                    strong: ({ children }) => (
                      <strong className="font-semibold">{children}</strong>
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PrivacyPolicyModal
