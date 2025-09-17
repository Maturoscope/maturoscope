import { DynamicPageHeader } from "@/components/DynamicPageHeader"

export default function MembersPage() {
  return (
    <>
      <DynamicPageHeader currentPageLabel="Members" />
      <div className="flex flex-1 flex-col gap-4 p-6">
        <h1 className="text-3xl font-bold">Members</h1>
      </div>
    </>
  )
}
