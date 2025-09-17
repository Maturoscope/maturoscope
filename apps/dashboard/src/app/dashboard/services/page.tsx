import { DynamicPageHeader } from "@/components/DynamicPageHeader"

export default function ServicesPage() {
  return (
    <>
      <DynamicPageHeader currentPageLabel="Services" />
      <div className="flex flex-1 flex-col gap-4 p-6">
        <h1 className="text-3xl font-bold">Services</h1>
      </div>
    </>
  )
}