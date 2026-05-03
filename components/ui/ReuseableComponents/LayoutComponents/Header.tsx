'use client'

import React from 'react';
import { User } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { Button } from '../../button';
import { ArrowLeft } from 'lucide-react';
import { CloudLightningIcon} from 'lucide-react';
import PurpleIcon from '@/components/ui/ReuseableComponents/PurpleIcon/index';
import UseWebinarButton from '@/components/ui/ReuseableComponents/CreateWebinarButton/index';



type Props = {
    user: User;
}

const Header = ({user}: Props) => {
    const pathname = usePathname();
    const router = useRouter();
  return (
    <div className='w-full px-4 pt-10 sticky top-0 z-10 flex justify-between items-center flex-wrap gap-4 bg-background'>
        {pathname === '/pipeline' ? (
            <Button className='bg-primary/10 border border-border rounded-xl'
            variant={'outline'}
            onClick={()=>router.push('/webinar')}>
                <ArrowLeft className='mr-2'/>Back to Webinars
                </Button>
        ):(
            <div
            className='px-4 py-2 flex justify-center text-bold items-center rounded-xl bg-background border border-border text-primary capitalize'>
             {pathname.split('/')[1]}
            </div>)}
            <div className='flex-gap-6 items-center flex-wrap'>
          <PurpleIcon>
            <CloudLightningIcon/>
            </PurpleIcon>
            </div>
                        <UseWebinarButton />

    </div>
  )
}

export default Header