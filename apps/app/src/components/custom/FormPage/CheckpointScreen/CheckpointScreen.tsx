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
  isLoading?: boolean
  onButtonClick: () => void | Promise<void>
  onReviewClick: () => void
}

const CheckpointScreen = ({
  icon,
  title,
  description,
  buttonLabel,
  reviewLabel,
  isLoading,
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
          disabled={isLoading}
          className="bg-white border border-border text-foreground hover:bg-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{reviewLabel}</span>
        </Button>
        <Button onClick={onButtonClick} accent disabled={isLoading}>
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Generating report...</span>
            </>
          ) : (
            <>
              <span>{buttonLabel}</span>
              <ArrowNextIcon className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default CheckpointScreen
