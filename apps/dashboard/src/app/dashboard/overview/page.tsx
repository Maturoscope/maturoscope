import { DynamicPageHeader } from "@/components/DynamicPageHeader"

export default function Page() {
  return (
    <>
      <DynamicPageHeader currentPageLabel="Dashboard" />
      <div className="flex flex-1 flex-col gap-4 p-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>
    </>
  )
}
