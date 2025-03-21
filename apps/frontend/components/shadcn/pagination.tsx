import { type ButtonProps, buttonVariants } from '@/components/shadcn/button'
import { cn } from '@/libs/utils'
import { MoreHorizontal } from 'lucide-react'
import * as React from 'react'
import { FaCirclePlay } from 'react-icons/fa6'

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn('mx-auto flex w-full justify-center', className)}
    {...props}
  />
)

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('flex flex-row items-center gap-1', className)}
    {...props}
  />
))
PaginationContent.displayName = 'PaginationContent'

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('', className)} {...props} />
))
PaginationItem.displayName = 'PaginationItem'

type PaginationButtonProps = {
  isActive?: boolean
} & Pick<ButtonProps, 'size'> &
  React.ComponentProps<'button'>

const PaginationButton = ({
  className,
  isActive,
  size = 'icon',
  ...props
}: PaginationButtonProps) => (
  <PaginationItem>
    <button
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        buttonVariants({ variant: 'ghost', size }),
        'text-base',
        isActive
          ? 'text-primary-strong hover:text-primary-light hover:bg-gray-100'
          : 'text-[#8A8A8A] hover:text-slate-400',
        className
      )}
      {...props}
    />
  </PaginationItem>
)
PaginationButton.displayName = 'PaginationButton'

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ButtonProps, 'size'> &
  React.ComponentProps<'a'>

const PaginationLink = ({
  className,
  isActive,
  size = 'icon',
  ...props
}: PaginationLinkProps) => (
  <PaginationItem>
    <a
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        buttonVariants({
          variant: isActive ? 'outline' : 'ghost',
          size
        }),
        className
      )}
      {...props}
    />
  </PaginationItem>
)
PaginationLink.displayName = 'PaginationLink'

const PaginationPrevious = ({
  className,
  isActive,
  ...props
}: React.ComponentProps<typeof PaginationButton>) => (
  <PaginationButton
    aria-label="Go to previous page"
    size="default"
    className={cn(!isActive && 'cursor-not-allowed', 'relative', className)}
    {...props}
  >
    {!isActive && (
      <div className="absolute z-0 h-4 w-4 rounded-full bg-[#C4C4C4]" />
    )}
    <FaCirclePlay
      color={isActive ? '#3581FA' : '#EBEBEB'}
      className="z-10 h-6 w-6 rotate-180"
    />
  </PaginationButton>
)
PaginationPrevious.displayName = 'PaginationPrevious'

const PaginationNext = ({
  className,
  isActive,
  ...props
}: React.ComponentProps<typeof PaginationButton>) => (
  <PaginationButton
    aria-label="Go to next page"
    size="default"
    className={cn(!isActive && 'cursor-not-allowed', 'relative', className)}
    {...props}
  >
    {!isActive && (
      <div className="absolute z-0 h-4 w-4 rounded-full bg-[#C4C4C4]" />
    )}
    <FaCirclePlay
      color={isActive ? '#3581FA' : '#EBEBEB'}
      className="z-10 h-6 w-6"
    />
  </PaginationButton>
)

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<'span'>) => (
  <span
    aria-hidden
    className={cn('flex h-9 w-9 items-center justify-center', className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationButton,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
}
