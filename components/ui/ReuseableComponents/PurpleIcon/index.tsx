import React from 'react'
import { cn } from '@/lib/utils'

type Props = {
    className?: string;
    children?: React.ReactNode;
}

const index = ({className, children}: Props) => {
  return (
    <div className={cn('px-4 py-2 iconBackground',className)}>{children}</div>
  )
}

export default index