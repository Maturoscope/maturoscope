import { Button } from "@/components/ui/button"

export interface HeroProps {
  title: string
  cancelButtonLabel: string
  saveButtonLabel: string
}

const STAGE_NAME_MAP = {
  trl: "TRL",
  mkrl: "MKRL",
  mfrl: "MfRL",
}

const Hero = ({
  title,
  cancelButtonLabel,
  saveButtonLabel,
  stageName,
}: HeroProps & { stageName: string }) => {
  const formattedTitle = title.replace(
    "[STAGE_NAME]",
    STAGE_NAME_MAP[stageName as keyof typeof STAGE_NAME_MAP]
  )

  return (
    <div className="flex items-center justify-between w-full px-4 lg:p-6">
      <h1 className="text-2xl font-semibold">{formattedTitle}</h1>
      <div className="flex items-center justify-between gap-1">
        <Button variant="outline">{cancelButtonLabel}</Button>
        <Button variant="default" accent>
          {saveButtonLabel}
        </Button>
      </div>
    </div>
  )
}

export default Hero
