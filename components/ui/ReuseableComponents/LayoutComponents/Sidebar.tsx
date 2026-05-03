'use client'

import { Sparkle } from 'lucide-react'
import { usePathname } from 'next/navigation'
import React from 'react'
import { sidebarData } from '@/lib/data'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'

export const Sidebar = () => {
  const pathname = usePathname()

  return (
    <div
      className="w-18 sm:w-28 h-screen sticky top-0 py-10 px-2 
      sm:px-6 border bg-background border-border flex flex-col 
      items-center justify-start gap-10">
     <div className='mb-4'>
      <Sparkle className="w-6 h-6"/>
      </div>
      <div className='w-full h-full justify-between flex flex-col items-center'>
      <div className='w-full h-fit flex flex-col gap-4 items-center justify-center'>
          {sidebarData.map((item) => (
        <TooltipProvider key={item.title}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link 
              href={item.link}
               className={`flex items-center gap-2 cursor-pointer rounded-lg  p-2 ${pathname.includes(item.link) ? 'iconBackground':''}`}>
              <item.icon className="w-5 h-5"/>
              </Link>
              </TooltipTrigger>
              <TooltipContent side='right'>
                <span className='text-xm'>{item.title}</span>
              </TooltipContent>
              </Tooltip>
              </TooltipProvider>
        ))}
      </div>
      <UserButton/>
      </div>
    </div>
  )
}
