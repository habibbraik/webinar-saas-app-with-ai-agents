import React from 'react';
import { onAuthenticateUser } from '@/actions/auth';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/ui/ReuseableComponents/LayoutComponents/Sidebar';
import Header from '@/components/ui/ReuseableComponents/LayoutComponents/Header';

type Props = {
    children: React.ReactNode
}

const layout = async ({children}: Props) => {
  const result =  await onAuthenticateUser();
  if(!result.user){
    redirect('/sign-in');
  }
  return (
    <div className='flex w-full min-h-screen'>
      {/* SideBar */}
      <Sidebar/>
      <div className='flex flex-col w-full h-screen overflow-auto px-4 container mx-auto'>
        {/* Header */}
        <Header user={result.user}/>
        <div className="flex-1 my-10 px-4">{children}</div>
      </div>
    </div>
  )
}

export default layout