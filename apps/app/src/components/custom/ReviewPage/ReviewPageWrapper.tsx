"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Toast } from "@/components/ui/toast"

interface ReviewPageWrapperProps {
  children: React.ReactNode
  toast: {
    title: string
    description: string
  }
}

export function ReviewPageWrapper({ children, toast }: ReviewPageWrapperProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    const saved = searchParams.get("saved")
    if (saved === "true") {
      setShowToast(true)
      // Clean up the URL without the query parameter
      const url = window.location.pathname
      router.replace(url)
    }
  }, [searchParams, router])

  return (
    <>
      {children}
      <Toast
        title={toast.title}
        description={toast.description}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        showIcon={true}
      />
    </>
  )
}

