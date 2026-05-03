import { } from '@prisma/client'
import {changeAttendanceType} from '@/actions/attendance';
import { stripe } from '@/lib/stripe';

// export const createCheckoutLink = async (
//     priceId: string,
//     stripeId: string,
//     attendeeId: string,
//     webinarId: string,
//     bookCall: boolean = false,
// ) => {

//     try {

//         const session = await stripe.checkout.sessions.create({
//             line_items: [
//                 {
//                     price: priceId,
//                     quantity: 1,
//                 },
//             ],
//             mode: 'payment',
//             success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
//             cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
//             metadata: {
//                 attendeeId: attendeeId,
//                 webinarId: webinarId,
//             },
//         }, {
//             stripeAccount: stripeId,
//         }
//         );
//         if (bookCall) {
//             await changeAttendanceType(attendeeId, webinarId, "ADDED_TO_CART");
//         }

//         return {
//             success: true,
//             status: 200,
//             url: session.url,
//         };
//     } catch (error) {
//         console.error('Error creating checkout link:', error);
//         return {
//             success: false,
//             status: 500,
//             error: 'Error creating checkout session',
//             message: 'Internal Server Error',
//         };
//     }


// }
