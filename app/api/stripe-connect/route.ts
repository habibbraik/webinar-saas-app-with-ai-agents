import { prisma as prismaClient } from '@/lib/prismaClient';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code || !state) {
      console.error('Missing required parameters:', { code, state })
      return NextResponse.redirect(
        new URL(
          '/settings?success=false&message=Missing+required+parameters',
          request.url
        )
      )
    }

    console.log('Processing Stripe Connect callback:', { code, stateId: state });

    try {
        const response=await stripe.oauth.token({
            grant_type:'authorization_code',
            code,
        });

        if(!response.stripe_user_id){
            throw new Error('Stripe user ID not found in response');
            }

        await prismaClient.user.update({
            where:{
                id:state
            },
            data:{
                stripeConnectId:response.stripe_user_id,
            }
        });

        console.log('Successfully linked Stripe account:', {
            userId: state,
            stripeUserId: response.stripe_user_id,
        });

        return NextResponse.redirect(
            new URL(
              '/settings?success=true&message=Stripe+account+linked+successfully',
              request.url
            )
          );

    } catch (StripeError) {
        console.error('Stripe connection error:', StripeError);
    }

    return NextResponse.redirect(
      new URL(
        `/settings?success=false&message=${encodeURIComponent(
        (StripeError as Error).message
        )}`,
        request.url
      )
    );
  } catch (error) {
    console.error('Unexpected error in Stripe callback handler:', error);

    return NextResponse.redirect(
      new URL(
        '/settings?success=false&message=An+unexpected+error+occurred',
        request.url
      )
    );
  }
}