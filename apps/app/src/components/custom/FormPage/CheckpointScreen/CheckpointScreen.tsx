// Packages
import Image from "next/image"
// Components
import Heading from "@/components/common/Heading/Heading"
import { Button } from "@/components/ui/button"

interface CheckpointScreenProps {
  icon: string
  title: string
  description: string
  reviewLabel: string
  buttonLabel: string
  onButtonClick: () => void
  onReviewClick: () => void
}

const CheckpointScreen = ({
  icon,
  title,
  description,
  buttonLabel,
  reviewLabel,
  onButtonClick,
  onReviewClick,
}: CheckpointScreenProps) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-w-[1280px] px-6 pb-26 pt-24 lg:pt-0">
      <Image src={icon} alt={title} width={60} height={60} />
      <Heading
        title={title}
        description={description}
        className="my-8 w-full max-w-[725px] text-center items-center gap-6 [&_h1]:font-bold"
      />
      <div className="flex items-center justify-between gap-3">
        <Button
          onClick={onReviewClick}
          className="bg-white border border-border text-foreground hover:bg-foreground/5"
        >
          <span className="hidden lg:block">{reviewLabel}</span>
        </Button>
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
    </div>
  )
}

export default CheckpointScreen
