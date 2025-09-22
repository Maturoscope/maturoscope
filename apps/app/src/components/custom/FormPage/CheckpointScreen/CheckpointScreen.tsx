// Packages
import Image from "next/image"
// Components
import Heading from "@/components/common/Heading/Heading"
import { Button } from "@/components/ui/button"

interface CheckpointScreenProps {
  icon: string
  title: string
  description: string
  buttonLabel: string
  onButtonClick: () => void
}

const CheckpointScreen = ({
  icon,
  title,
  description,
  buttonLabel,
  onButtonClick,
}: CheckpointScreenProps) => {
  return (
    <div className="flex flex-col items-start justify-center w-full h-full max-w-[1280px] px-6 pb-26 pt-24 lg:pt-0">
      <Image src={icon} alt={title} width={60} height={60} />
      <Heading
        title={title}
        description={description}
        className="my-8 w-full max-w-[724px]"
      />
      <Button onClick={onButtonClick}>
        <span className="hidden lg:block">{buttonLabel}</span>
        <Image
          src="/icons/form/arrow-next.svg"
          alt="Arrow Next"
          width={16}
          height={16}
        />
      </Button>
    </div>
  )
}

export default CheckpointScreen
