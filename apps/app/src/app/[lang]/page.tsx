// Packages
import Image from "next/image"
// Actions
import { getOrganizationByKey } from "@/actions/organization"

interface HomeProps {
  searchParams: {
    key: string
  }
}

const Home = async ({ searchParams }: HomeProps) => {
  const { key } = searchParams
  const organization = await getOrganizationByKey(key)

  console.log({ organization })

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/images/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <p>App web 🤓 </p>
      </main>
    </div>
  )
}

export default Home
