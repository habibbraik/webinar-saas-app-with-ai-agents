'use client';
import React, { useEffect, useState } from 'react'
import {User} from '@prisma/client';
import { WebinarWithPresenter } from '@/lib/type';
import { User as StreamUser, StreamVideo, StreamVideoClient } from '@stream-io/video-react-sdk';
import CustomLivestreamPlayer from './CustomLivestreamPlayer';
import { generateStreamChatToken } from '@/actions/stream';

type Props = {
    apiKey: string;
    token:string;
    callId: string;
    webinar: WebinarWithPresenter;
    user: User;
}

const LiveStreamState = ({
    apiKey,
    token,
    callId,
    webinar,
    user
}: Props) => {
    const [chatToken, setChatToken] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const fetchChatToken = async () => {
        const result = await generateStreamChatToken(user.id);
        if (result.success && result.token) {
          setChatToken(result.token);
        }
        setIsLoading(false);
      };
      fetchChatToken();
    }, [user.id]);

    const hostUser:StreamUser={ id: user.id, name: user.name || 'Host User'};
    const client=new StreamVideoClient({apiKey, token, user: hostUser});
    
    if (isLoading) {
      return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }
    
  return (
    <StreamVideo client={client}>
      <CustomLivestreamPlayer
      callId={callId}
      callType="livestream"
      webinar={webinar}
      token={chatToken}
      username={user.name || 'Guest'}
      userId={user.id}
      />
    </StreamVideo>
  )
}

export default LiveStreamState