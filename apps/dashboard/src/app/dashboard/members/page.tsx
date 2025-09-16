import { PageHeader } from "@/components/Header"

export default function MembersPage() {
  const breadcrumbs = [{ label: "Nobatek", href: "/dashboard" }, { label: "Members" }]

  return (
    <>
      <PageHeader breadcrumbs={breadcrumbs} />
      <div className="flex flex-1 flex-col gap-4 p-6">
        <h1 className="text-3xl font-bold">Members</h1>
      </div>
    </>
  )
}
