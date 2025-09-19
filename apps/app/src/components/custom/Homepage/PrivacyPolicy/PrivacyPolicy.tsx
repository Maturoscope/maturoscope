// Packages
import Image from "next/image"

interface PrivacyPolicyProps {
  description: string
}

const PrivacyPolicy = ({ description }: PrivacyPolicyProps) => {
  return (
    <div className="flex gap-4 w-full max-w-[1280px] px-6 mt-24">
      <Image
        src="/icons/homepage/flag-europe.svg"
        alt="Europe Flag"
        width={90}
        height={60}
      />
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

export default PrivacyPolicy
