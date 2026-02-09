export interface HeroProps {
  title: string
}

const STAGE_NAME_MAP = {
  trl: "TRL",
  mkrl: "MkRL",
  mfrl: "MfRL",
}

const Hero = ({ title, stageName }: HeroProps & { stageName: string }) => {
  const formattedTitle = title.replace(
    "[STAGE_NAME]",
    STAGE_NAME_MAP[stageName as keyof typeof STAGE_NAME_MAP]
  )

  return (
    <div className="flex items-center justify-between w-full py-6 px-4 lg:p-6">
      <h1 className="text-2xl font-semibold">{formattedTitle}</h1>
    </div>
  )
}

export default Hero
