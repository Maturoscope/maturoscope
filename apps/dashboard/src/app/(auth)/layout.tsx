import React from "react";
import { LanguageButton } from "@/components/LanguajeSelector/LanguajeButton";
import { Search } from "lucide-react"

export default function LoginPage({children}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex gap-2 justify-between">
          <div className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Search className="size-4" />
            </div>
            <p>Maturoscope</p>
          </div>
          <LanguageButton />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-[374px]">
            {children}
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src='/img/auth_bg.webp'
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
