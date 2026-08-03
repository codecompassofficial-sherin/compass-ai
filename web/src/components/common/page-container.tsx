import { cn } from '@/lib/utils'

export function PageContainer({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
