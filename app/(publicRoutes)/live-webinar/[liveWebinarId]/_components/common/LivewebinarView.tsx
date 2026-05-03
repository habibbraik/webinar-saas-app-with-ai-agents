'use client';
import { WebinarWithPresenter } from '@/lib/type';
import { User, Users, Mic, MicOff, Video, VideoOff, Loader2 } from 'lucide-react';
import { MessageSquare } from 'lucide-react';
import { ParticipantView, useCallStateHooks, useCall, LivestreamPlayer } from '@stream-io/video-react-sdk';
import React, { useEffect, useState } from 'react'
import { StreamChat } from 'stream-chat'
import { Chat, Channel, MessageList, MessageInput } from 'stream-chat-react'
import { CtaTypeEnum } from '@prisma/client';
import { Button } from '@/components/ui/button';
import 'stream-chat-react/dist/css/v2/index.css';
import CTADialogBox from './CTADialogBox';
import { changeWebinarStatus } from '@/actions/webinar';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type Props = {
  showChat: boolean;
  setShowChat: (show: boolean) => void;
  webinar: WebinarWithPresenter;
  isHost?: boolean;
  username: string;
  userId: string;
  userToken: string;
}

const LivewebinarView = ({
  showChat,
  setShowChat,
  webinar,
  isHost,
  username,
  userId,
  userToken
}: Props) => {

  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isCameraMuted, setIsCameraMuted] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [loading, setLoading] = useState(false);

  const { useParticipantCount, useParticipants } = useCallStateHooks();
  const viewerCount = useParticipantCount();
  const participants = useParticipants();
  const hostParticipant = participants.length > 0 ? participants[0] : null;
  const router = useRouter();

  // Get the call instance for camera and microphone controls
  const call = useCall();

  const toggleCamera = async () => {
    if (!call) return;
    try {
      if (isCameraMuted) {
        await call.camera.enable();
        setIsCameraMuted(false);
      } else {
        await call.camera.disable();
        setIsCameraMuted(true);
      }
    } catch (error) {
      console.error('Failed to toggle camera:', error);
    }
  };

  const toggleMicrophone = async () => {
    if (!call) return;
    try {
      if (isMicMuted) {
        await call.microphone.enable();
        setIsMicMuted(false);
      } else {
        await call.microphone.disable();
        setIsMicMuted(true);
      }
    } catch (error) {
      console.error('Failed to toggle microphone:', error);
    }
  };

  useEffect(() => {
    if (chatClient && channel) {
      channel.on((event: any) => {
        if (event.type === 'open_cta_dialog' && isHost) {
          setDialogOpen(true);
        }
      });
    }
  }, [chatClient, channel, isHost]);

  useEffect(() => {
    const initChat = async () => {
      try {
        const client = StreamChat.getInstance(
          process.env.NEXT_PUBLIC_STREAM_API_KEY!
        )

        await client.connectUser(
          {
            id: userId,
            name: username,
          },
          userToken
        )

        const channel = client.channel('livestream', webinar.id, {
          name: webinar.title,
        })

        await channel.watch()
        setChatClient(client);
        setChannel(channel);
      } catch (error) {
        console.error('Failed to initialize chat:', error);
      }
    }

    initChat();

    return () => {
      if (chatClient) {
        chatClient.disconnectUser().catch(console.error);
      }
    }
  }, [userId, userToken, username, webinar.id, webinar.title]);


  const handleEndStream = async () => {
    setLoading(true);
    try {
      // Add your end stream logic here
      const res = await changeWebinarStatus(webinar.id, 'ENDED');
      if (!res.success) {
        throw new Error(res.message || 'Failed to end webinar');
      }
      router.refresh();
      toast.success('Stream ended successfully');
    } catch (error) {
      console.error('Failed to end stream:', error);
      toast.error('Failed to end stream');
    } finally {
      setLoading(false);
    }
  }

  const handleCtaButtonClick = async () => {
    if (!channel) return
    console.log('CTA button clicked', channel)
    await channel.sendEvent({
      type: 'open_cta_dialog',
    })
  }


  if (!chatClient || !channel) return null;

  return (
    <div>
      <div className="py-2 px-4 border-b border-border-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-accent-primary/10 text-primary py-1 rounded-full text-sm font-medium flex items-center">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive animate-pulse"></span>
            </span>
            <span>LIVE</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-muted/50 px-3 py-1 rounded-full">
            <User size={16} />
            <span className="text-sm">{viewerCount}</span>
          </div>
          <button
            onClick={() => setShowChat(!showChat)}
            className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 ${showChat
              ? "bg-accent-primary text-primary-foreground"
              : "bg-muted/50"
              }`}
          >
            <MessageSquare size={16} />
            <span className=''>Chat</span>
          </button>
        </div>
      </div>
      <div className="flex flex-1 p-2 gap-2 overflow-hidden min-h-[500px] max-h-[80vh]">
        <div className="flex-1 rounded-lg overflow-hidden border border-border flex flex-col bg-card">
          <div className="flex-1 relative overflow-hidden">
            {/* Use LivestreamPlayer for RTMP/OBS streams */}
            <div className="w-full h-full">
              <LivestreamPlayer
                className="w-full h-full object-cover"
              />
            </div>
            {isHost && (
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                You are streaming as {username}
              </div>
            )}
          </div>

          <div className='p-2 border-t border-border flex items-center justify-between py-2'>
            <div className='flex items-center space-x-2'>
              <div className='text-sm font-medium capitalize'>
                {webinar?.title}
              </div>
            </div>

            {isHost && (
              <div className="flex items-center space-x-2">
                <Button onClick={handleEndStream} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "End Stream"
                  )}
                </Button>
                <Button
                  onClick={handleCtaButtonClick}>
                  {webinar.ctaType === CtaTypeEnum.BOOK_A_CALL
                    ? 'Book a Call'
                    : 'Buy Now'}
                </Button>
              </div>
            )}

          </div>
        </div>

        {showChat && (
          <Chat client={chatClient}>
            <Channel channel={channel}>
              <div className="w-72 bg-card border border-border rounded-lg overflow-hidden flex flex-col">
                <div className="py-2 px-3 border-b border-border font-medium flex items-center justify-between">
                  <span>Chat</span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                    {viewerCount} viewers
                  </span>
                </div>

                <MessageList />

                <div className="p-2 border-t border-border">
                  <MessageInput />
                </div>

              </div>
            </Channel>
          </Chat>
        )}


      </div>

      {dialogOpen && (
        <CTADialogBox
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          webinar={webinar}
          userId={userId}
        />
      )}


    </div>
  )
}

export default LivewebinarView