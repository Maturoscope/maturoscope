import { PageHeader } from "@/components/Header"

export default function ServicesPage() {
  const breadcrumbs = [{ label: "Nobatek", href: "/dashboard" }, { label: "Services" }]

  return (
    <>
      <PageHeader breadcrumbs={breadcrumbs} />
      <div className="flex flex-1 flex-col gap-4 p-6">
        <h1 className="text-3xl font-bold">Services</h1>
      </div>
    </>
  )
}