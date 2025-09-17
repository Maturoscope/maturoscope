import { DynamicPageHeader } from "@/components/DynamicPageHeader"

export default function SettingsProfilePage() {
  return (
    <>
      <DynamicPageHeader currentPageLabel="Settings" />
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="space-y-6 max-w-2xl">
          <h2 className="text-xl font-semibold">Profile</h2>
        </div>
      </div>
    </>
  )
}
