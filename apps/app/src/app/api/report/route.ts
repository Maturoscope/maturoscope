import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get("lang") || "en"

    if (!lang || !["en", "fr"].includes(lang)) {
      return NextResponse.json(
        { message: "Invalid language parameter" },
        { status: 400 }
      )
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    if (!apiUrl) {
      return NextResponse.json(
        { message: "API URL is not configured" },
        { status: 500 }
      )
    }

    const body = await request.json()

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000) // 30 seconds timeout for PDF generation

    const response = await fetch(`${apiUrl}/report/${lang}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error")
      return NextResponse.json(
        { message: `Failed to generate PDF: ${errorText}` },
        { status: response.status }
      )
    }

    const blob = await response.blob()

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="maturity-report.pdf"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { message: "Request timeout" },
        { status: 408 }
      )
    }

    console.error("Error generating PDF:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

