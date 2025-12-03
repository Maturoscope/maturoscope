// Components
import Heading from "@/components/common/Heading/Heading"
import { Button } from "@/components/ui/button"
import { ArrowNextIcon } from "@/components/icons"
import { getIconComponent } from "@/components/icons/iconMap"

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
  const IconComponent = getIconComponent(icon)

  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-w-[1280px] px-6 pb-26 pt-24 lg:pt-0">
      {IconComponent && <IconComponent accent className="w-[60px] h-[60px]" />}
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
          <span>{reviewLabel}</span>
        </Button>
        <Button onClick={onButtonClick} accent>
          <span>{buttonLabel}</span>
          <ArrowNextIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

export default CheckpointScreen
