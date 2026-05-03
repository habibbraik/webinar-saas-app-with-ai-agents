import { Call, StreamCall, useStreamVideoClient } from '@stream-io/video-react-sdk';
import React, { useEffect, useState } from 'react'
import { WebinarWithPresenter } from '@/lib/type';
import LivewebinarView from '../common/LivewebinarView';

type Props = {
    callId: string;
    callType: string;
    webinar: any;
    token: string;
    username: string;
    userId: string;
}

const CustomLivestreamPlayer = ({
    callId,
    callType,
    webinar,
    token,
    username,
    userId
}: Props) => {

    const client = useStreamVideoClient();
    const [call, setCall] = useState<Call>();
    const [showChat, setShowChat] = useState(true);

    useEffect(() => {
        if (!client) return

        const myCall = client.call(callType, callId)
        setCall(myCall)
        
        // Host creates or gets the call for OBS/RTMP streaming
        myCall.getOrCreate({
            ring: false,
            data: {
                members: [],
            },
        }).then(async () => {
            // For OBS streaming, just join without enabling browser camera/mic
            // The stream comes from OBS via RTMP
            return myCall.join();
        }).catch((e) => {
            console.error('Failed to create/join call', e)
        })

        return () => {
            myCall.leave().catch((e) => {
                console.error('Failed to leave call', e)
            })
            setCall(undefined)
        }
    }, [client, callId, callType])

    if(!call) return null

    return (
        <StreamCall call={call}>
            <LivewebinarView
            showChat={showChat}
            setShowChat={setShowChat}
            webinar={webinar}
            isHost={true}
            username={username}
            userId={userId}
            userToken={token}
            />
        </StreamCall>
    )
}

export default CustomLivestreamPlayer