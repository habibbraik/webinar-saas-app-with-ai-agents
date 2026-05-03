import { onAuthenticateUser } from '@/actions/auth'
import { getWebinarById } from '@/actions/webinar'
import { getStreamIoToken, generateStreamChatToken } from '@/actions/stream'
import React from 'react'
import RenderWebinar from './_components/RenderWebinar'

type Props = {
  params: Promise<{
    liveWebinarId: string
  }>
  searchParams: Promise<{
    error: string
  }>
}

const page = async ({ params, searchParams }: Props) => {
  const { liveWebinarId } = await params
  const { error } = await searchParams

  const webinarData = await getWebinarById(liveWebinarId)

  if(!webinarData){
    return <div className='w-full min-h-screen flex justify-center items-center text-lg sm:text-4xl'>Webinar not found</div>
  }

  const checkUser=await onAuthenticateUser();

  const apiKey=process.env.NEXT_PUBLIC_STREAM_API_KEY as string;
  // Use the webinar ID as the call ID
  const callId = webinarData.id;
  
  // Generate token dynamically for the authenticated user
  let token = '';
  if (checkUser.user) {
    token = await getStreamIoToken({
      id: checkUser.user.id,
      name: checkUser.user.name,
      email: checkUser.user.email,
    } as any);
  }

  return <div className='w-full min-h-screen mx-auto'>
    <RenderWebinar
    apiKey={apiKey}
    token={token}
    callId={callId}
    user={checkUser.user || null}
    error={error}
    webinar={webinarData}
    />
  </div>
}

export default page