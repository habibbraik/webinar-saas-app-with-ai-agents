import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';

// POST /api/availability - Check time slot availability
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { date, time } = body;

        if (!date || !time) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Date and time are required',
                },
                { status: 400 }
            );
        }

        // Check if the time slot is already booked
        const existingAppointment = await prisma.appointment.findFirst({
            where: {
                date: new Date(date),
                time: time,
                status: {
                    not: 'CANCELLED',
                },
            },
        });

        const isAvailable = !existingAppointment;

        return NextResponse.json({
            success: true,
            available: isAvailable,
            message: isAvailable
                ? 'Time slot is available'
                : 'Time slot is already booked',
        });
    } catch (error) {
        console.error('Error checking availability:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to check availability',
            },
            { status: 500 }
        );
    }
}
