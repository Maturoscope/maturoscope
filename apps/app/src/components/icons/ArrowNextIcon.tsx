import { Icon } from "@/components/common/Icon/Icon"
import { cn } from "@/lib/utils"

interface ArrowNextIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
  accent?: boolean
}

export const ArrowNextIcon = ({
  className,
  accent = false,
  ...props
}: ArrowNextIconProps) => {
  return (
    <Icon
      width={16}
      height={16}
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(accent && "text-accent", className)}
      {...props}
    >
      <path
        d="M3.33203 7.99967H12.6654M12.6654 7.99967L7.9987 3.33301M12.6654 7.99967L7.9987 12.6663"
        stroke="currentColor"
        strokeWidth="1.33"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  )
}

