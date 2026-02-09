// Utils
import { cn } from "@/lib/utils"

interface BoxProps {
  children: React.ReactNode
  className?: string
}

const Box = ({ children, className }: BoxProps) => {
  return (
    <div className={cn("w-full border rounded-[14px] p-5 bg-white", className)}>
      {children}
    </div>
  )
}

export default Box
