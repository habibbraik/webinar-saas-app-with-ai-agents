'use client'
import React, { useEffect, useRef, useState } from 'react'
import { WebinarWithPresenter } from '@/lib/type'
import { useAttendeeStore } from '@/store/useAttendeeStore'
import { Call, StreamCall, StreamVideo, StreamVideoClient, type User } from '@stream-io/video-react-sdk'
import { getStreamIoToken, generateStreamChatToken } from '@/actions/stream'
import { Button } from '@/components/ui/button'
import { Loader2, WifiOff, AlertCircle } from 'lucide-react'
import LiveWebinarView from '../common/LivewebinarView'


type Props = { apiKey: string; callId: string; webinar: WebinarWithPresenter }


const Participant = ({ apiKey, callId, webinar }: Props) => {
    const { attendee } = useAttendeeStore()
    const [showChat, setShowChat] = useState<boolean>(true)
    const [client, setClient] = useState<StreamVideoClient | null>(null)
    const [call, setCall] = useState<Call | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [chatToken, setChatToken] = useState<string | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [connectionStatus, setConnectionStatus] = useState<
        'connecting' | 'failed' | 'reconnecting' | 'connected'
    >('connecting')

    const clientInitialized = useRef<boolean>(false);

    useEffect(() => {
        if (clientInitialized.current) return

        const initClient = async () => {
            try {
                setConnectionStatus('connecting')
                const user: User = {
                    id: attendee?.id || 'guest',
                    name: attendee?.name || 'Guest',
                    image: `api.dicebear.com{
          attendee?.name || 'Guest'
        }`,
                }

                const userToken = await getStreamIoToken(attendee);
                setToken(userToken);

                // Generate chat token
                const chatTokenResult = await generateStreamChatToken(attendee?.id || 'guest');
                if (chatTokenResult.success && chatTokenResult.token) {
                    setChatToken(chatTokenResult.token);
                }

                const streamClient = new StreamVideoClient({
                    apiKey,
                    token: userToken,
                    user
                });

                streamClient.on('connection.changed', (event) => {
                    if (event.online) {
                        setConnectionStatus('connected')
                    } else {
                        setConnectionStatus('reconnecting')
                    }
                })

                await streamClient.connectUser(
                    user,
                    userToken
                );
                const streamCall = streamClient.call('livestream', callId)
                
                // Participants watch the livestream, they don't join backstage
                try {
                    // For livestreams, viewers should get the call and watch without joining backstage
                    await streamCall.get();
                    
                    setClient(streamClient);
                    setCall(streamCall);
                    setConnectionStatus('connected')
                    clientInitialized.current = true;
                } catch (joinError: any) {
                    console.error('Failed to join call:', joinError);
                    // Check if call doesn't exist (error code 16 or message contains "Can't find")
                    const errorMessage = joinError.message || '';
                    const errorCode = joinError.code;
                    
                    if (errorCode === 16 || errorMessage.includes("Can't find call") || errorMessage.includes('not found')) {
                        setErrorMessage('The webinar has not started yet. Please wait for the host to begin streaming.');
                        setConnectionStatus('failed');
                    } else {
                        setErrorMessage('Failed to connect to the webinar. Please try again.');
                        setConnectionStatus('failed');
                    }
                }

            } catch (error) {
                console.error('Error initializing Stream Video client:', error);
                setErrorMessage('Failed to connect to the webinar. Please try again.');
                setConnectionStatus('failed');

            }
        }

        initClient()

        return () => {
            const currentCall = call
            const currentClient = client

            if (currentCall && currentClient) {
                currentCall
                    .leave()
                    .then(() => {
                        console.log('Left the call')
                        currentClient.disconnectUser()
                        clientInitialized.current = false
                    })
                    .catch((error) => {
                        console.error('Error leaving call:', error)
                    })
            }
        }

    }, [apiKey, callId, attendee, call, client])

    if (!attendee) {
        <div className="flex items-center justify-center h-screen bg-background text-foreground">
            <div className="text-center max-w-md p-8 rounded-lg border border-border bg-card">
                <h2 className="text-2xl font-bold mb-4">
                    Please register to join the webinar
                </h2>
                <p className="text-muted-foreground mb-6">
                    Registration is required to participate in this webinar.
                </p>
                <Button onClick={() => window.location.reload()}
                    className="bg-accent-primary hover:bg-accent-primary/90 text-accent-foreground"
                >
                    Register Now
                </Button>
            </div>
        </div>
    }

    if (!client || !call || !token || !chatToken) {
        return (
            <div className="flex items-center justify-center h-screen bg-background text-foreground">
                <div className="text-center max-w-md p-8 rounded-lg border border-border bg-card">
                    {connectionStatus === 'connecting' && (
                        <>
                            <div className="relative mx-auto w-24 h-24 mb-6">
                                <div className="absolute inset-0 rounded-full border-t-2 animate-spin" style={{ borderTopColor: 'rgba(135, 49, 255, 0.75)' }}></div>
                                <div className="absolute inset-3 rounded-full bg-card flex items-center justify-center">
                                    <Loader2 className="h-10 w-10 animate-pulse" style={{ color: 'rgba(135, 49, 255, 0.75)' }} />
                                </div>
                            </div>
                            <h2 className="text-xl font-semibold mb-2">Joining Webinar</h2>
                            <p className="text-muted-foreground">
                                Connecting to {webinar.title}...
                            </p>
                            <div className="mt-6 flex justify-center space-x-1">
                                <span className="h-2 w-2 rounded-full animate-bounce" style={{ backgroundColor: 'rgba(135, 49, 255, 0.75)' }}></span>
                                <span className="h-2 w-2 rounded-full animate-bounce" style={{ backgroundColor: 'rgba(135, 49, 255, 0.75)', animationDelay: '0.2s' }}></span>
                                <span className="h-2 w-2 rounded-full animate-bounce" style={{ backgroundColor: 'rgba(135, 49, 255, 0.75)', animationDelay: '0.4s' }}></span>
                            </div>
                        </>
                    )}
                    {connectionStatus === 'reconnecting' && (
                        <>
                            <div className="mx-auto w-16 h-16 mb-4 text-amber-500">
                                <WifiOff className="h-16 w-16 animate-pulse" />
                            </div>
                            <h2 className="text-xl font-semibold mb-2">Reconnecting</h2>
                            <p className="text-muted-foreground mb-4">
                                Connection lost. Attempting to reconnect...
                            </p>
                            <div className="w-full bg-muted rounded-full h-2 mb-6">
                                <div
                                    className="bg-amber-500 h-2 rounded-full animate-pulse"
                                    style={{ width: '60%' }}
                                ></div>
                            </div>
                        </>
                    )}
                    {connectionStatus === 'failed' && (
                        <>
                            <div className="mx-auto w-16 h-16 mb-4 text-destructive">
                                <AlertCircle className="h-16 w-16" />
                            </div>
                            <h2 className="text-xl font-semibold mb-2">Connection Failed</h2>
                            <p className="text-muted-foreground mb-6">
                                {errorMessage || 'Unable to connect to the webinar.'}
                            </p>
                            <div className="flex space-x-4 justify-center">
                                <Button
                                    variant="outline"
                                    onClick={() => window.location.reload()}
                                >
                                    Try Again
                                </Button>
                                <Button
                                    className="bg-accent-primary hover:bg-accent-primary/90 text-accent-foreground"
                                    onClick={() => (window.location.href = '/')}
                                >
                                    Back to Home
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )
    }

    return (
        <StreamVideo client={client}>
            <StreamCall call={call}>
                <LiveWebinarView
                    showChat={showChat}
                    setShowChat={setShowChat}
                    webinar={webinar}
                    isHost={false}
                    username={attendee?.name || 'Guest'}
                    userId={attendee?.id || 'guest'}
                    userToken={chatToken}
                />
            </StreamCall>
        </StreamVideo>
    )
}

export default Participant
