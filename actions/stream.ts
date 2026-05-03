'use server';

import { getStreamClient } from '@/lib/stream/getStreamClient';
import { Attendee } from '@prisma/client';
import { UserRequest } from '@stream-io/node-sdk';
import { StreamChat } from 'stream-chat';

export async function generateStreamChatToken(userId: string) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
    const apiSecret = process.env.STREAM_SECRET;

    if (!apiKey || !apiSecret) {
      throw new Error('Stream API credentials not configured');
    }

    const serverClient = StreamChat.getInstance(apiKey, apiSecret);
    const token = serverClient.createToken(userId);

    return {
      success: true,
      token,
    };
  } catch (error) {
    console.error('Error generating Stream Chat token:', error);
    return {
      success: false,
      error: 'Failed to generate chat token',
      token: null,
    };
  }
}

export const getStreamIoToken = async (attendee: Attendee | null) => {
  try {
    const newUser: UserRequest = {
      id: attendee?.id || 'guest',
      role: 'user',
      name: attendee?.name || 'Guest',
      image: `https://api.dicebear.com/7.x/initials/svg?seed=${attendee?.name || 'Guest'}`,
    };

    await getStreamClient.upsertUsers([newUser]);

    const validity = 60 * 60 * 60; 
    const token = getStreamClient.generateUserToken({
      user_id: attendee?.id || 'guest',
      validity_in_seconds: validity,
    });

    return token;
  } catch (error) {
    console.error('Error generating Stream Io token:', error);
    if (error instanceof Error) {
      console.error('Stack Trace:', error.stack);
    }
    
    throw new Error('Failed to generate Stream Io token');
  }
};



