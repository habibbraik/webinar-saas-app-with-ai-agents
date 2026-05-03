import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';

// POST /api/webhook/vapi - Handle Vapi tool calls
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { message } = body;

        // Extract tool call information from Vapi payload
        const toolCall = message?.toolCalls?.[0];

        if (!toolCall) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'No tool call found in request',
                },
                { status: 400 }
            );
        }

        const { function: functionCall, id: toolCallId } = toolCall;
        const functionName = functionCall?.name;
        const args = functionCall?.arguments;

        // Handle different tool calls
        switch (functionName) {
            case 'checkAvailability': {
                const { date, time } = args;

                const existingAppointment = await prisma.appointment.findFirst({
                    where: {
                        date: new Date(date),
                        time: time,
                        status: { not: 'CANCELLED' },
                    },
                });

                const isAvailable = !existingAppointment;

                return NextResponse.json({
                    results: [
                        {
                            toolCallId,
                            result: {
                                available: isAvailable,
                                message: isAvailable
                                    ? `Yes, ${time} on ${date} is available.`
                                    : `Sorry, ${time} on ${date} is already booked. Would you like to try a different time?`,
                            },
                        },
                    ],
                });
            }

            case 'bookAppointment': {
                const {
                    customerName,
                    customerPhone,
                    customerEmail,
                    date,
                    time,
                    serviceType,
                    notes,
                } = args;

                // Validate required fields
                if (!customerName || !customerPhone || !date || !time || !serviceType) {
                    return NextResponse.json({
                        results: [
                            {
                                toolCallId,
                                result: {
                                    success: false,
                                    message: 'Please provide all required information: name, phone, date, time, and service type.',
                                },
                            },
                        ],
                    });
                }

                // Check availability
                const existingAppointment = await prisma.appointment.findFirst({
                    where: {
                        date: new Date(date),
                        time: time,
                        status: { not: 'CANCELLED' },
                    },
                });

                if (existingAppointment) {
                    return NextResponse.json({
                        results: [
                            {
                                toolCallId,
                                result: {
                                    success: false,
                                    message: 'This time slot is no longer available. Would you like to choose a different time?',
                                },
                            },
                        ],
                    });
                }

                // Create appointment
                const appointment = await prisma.appointment.create({
                    data: {
                        customerName,
                        customerPhone,
                        customerEmail: customerEmail || null,
                        date: new Date(date),
                        time,
                        serviceType,
                        notes: notes || null,
                        status: 'PENDING',
                    },
                });

                return NextResponse.json({
                    results: [
                        {
                            toolCallId,
                            result: {
                                success: true,
                                appointmentId: appointment.id,
                                message: `Great! Your appointment for ${serviceType} is booked on ${date} at ${time}. Your confirmation number is ${appointment.id}. We'll send you a reminder before your appointment.`,
                            },
                        },
                    ],
                });
            }

            case 'cancelAppointment': {
                const { appointmentId, customerPhone } = args;

                if (!appointmentId && !customerPhone) {
                    return NextResponse.json({
                        results: [
                            {
                                toolCallId,
                                result: {
                                    success: false,
                                    message: 'Please provide your appointment ID or phone number to cancel.',
                                },
                            },
                        ],
                    });
                }

                const where: any = {};
                if (appointmentId) {
                    where.id = appointmentId;
                } else if (customerPhone) {
                    where.customerPhone = customerPhone;
                    where.status = { not: 'CANCELLED' };
                }

                const appointment = await prisma.appointment.findFirst({ where });

                if (!appointment) {
                    return NextResponse.json({
                        results: [
                            {
                                toolCallId,
                                result: {
                                    success: false,
                                    message: 'No appointment found with that information.',
                                },
                            },
                        ],
                    });
                }

                await prisma.appointment.update({
                    where: { id: appointment.id },
                    data: { status: 'CANCELLED' },
                });

                return NextResponse.json({
                    results: [
                        {
                            toolCallId,
                            result: {
                                success: true,
                                message: `Your appointment on ${appointment.date.toISOString().split('T')[0]} at ${appointment.time} has been cancelled. Is there anything else I can help you with?`,
                            },
                        },
                    ],
                });
            }

            case 'rescheduleAppointment': {
                const { appointmentId, customerPhone, newDate, newTime } = args;

                if (!newDate || !newTime) {
                    return NextResponse.json({
                        results: [
                            {
                                toolCallId,
                                result: {
                                    success: false,
                                    message: 'Please provide both the new date and time for rescheduling.',
                                },
                            },
                        ],
                    });
                }

                const where: any = {};
                if (appointmentId) {
                    where.id = appointmentId;
                } else if (customerPhone) {
                    where.customerPhone = customerPhone;
                    where.status = { not: 'CANCELLED' };
                }

                const appointment = await prisma.appointment.findFirst({ where });

                if (!appointment) {
                    return NextResponse.json({
                        results: [
                            {
                                toolCallId,
                                result: {
                                    success: false,
                                    message: 'No appointment found with that information.',
                                },
                            },
                        ],
                    });
                }

                // Check new time slot availability
                const conflicting = await prisma.appointment.findFirst({
                    where: {
                        id: { not: appointment.id },
                        date: new Date(newDate),
                        time: newTime,
                        status: { not: 'CANCELLED' },
                    },
                });

                if (conflicting) {
                    return NextResponse.json({
                        results: [
                            {
                                toolCallId,
                                result: {
                                    success: false,
                                    message: 'The new time slot is not available. Would you like to try a different time?',
                                },
                            },
                        ],
                    });
                }

                const updated = await prisma.appointment.update({
                    where: { id: appointment.id },
                    data: {
                        date: new Date(newDate),
                        time: newTime,
                    },
                });

                return NextResponse.json({
                    results: [
                        {
                            toolCallId,
                            result: {
                                success: true,
                                message: `Your appointment has been rescheduled to ${newDate} at ${newTime}. Your confirmation number is ${updated.id}.`,
                            },
                        },
                    ],
                });
            }

            default:
                return NextResponse.json(
                    {
                        results: [
                            {
                                toolCallId,
                                result: {
                                    success: false,
                                    message: `Unknown function: ${functionName}`,
                                },
                            },
                        ],
                    },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Error handling Vapi webhook:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to process webhook',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
