import React from "react";
import { LanguageButton } from "@/components/LanguajeSelector/LanguajeButton";
import Image from "next/image";

export default function LoginPage({children}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col">
        <header className="w-full bg-white border-b border-gray-300 h-14 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Image
                src="/icons/maturoscope-desktop.svg"
                alt="Maturoscope"
                width={120}
                height={18}
              />
            </div>
          </div>
          <LanguageButton />
        </header>

        {/* Main Content */}
        <div className="flex flex-col gap-4 p-6 md:p-10 flex-1">
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-[374px]">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/img/auth_bg.webp"
          alt="Image"
          fill
          // Only shown on lg+ (right half of the screen); tell the optimizer so
          // it serves an appropriately sized, format-negotiated image.
          sizes="(min-width: 1024px) 50vw, 0px"
          className="object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
