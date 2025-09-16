import { PageHeader } from "@/components/Header"

export default function ReportsPage() {
  const breadcrumbs = [{ label: "Super-Admin", href: "/dashboard" }, { label: "Reports" }]

  return (
    <>
      <PageHeader breadcrumbs={breadcrumbs} />
      <div className="flex flex-1 flex-col gap-4 p-6">
        <h1 className="text-3xl font-bold">Reports</h1>
      </div>
    </>
  )
}