import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';

// GET /api/appointments - List all appointments
export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const status = searchParams.get('status');
        const date = searchParams.get('date');

        const where: any = {};

        if (status) {
            where.status = status;
        }

        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);

            where.date = {
                gte: startDate,
                lte: endDate,
            };
        }

        const appointments = await prisma.appointment.findMany({
            where,
            orderBy: [
                { date: 'asc' },
                { time: 'asc' },
            ],
        });

        return NextResponse.json({
            success: true,
            data: appointments,
        });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch appointments',
            },
            { status: 500 }
        );
    }
}

// POST /api/appointments - Create new appointment
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log("RECEIVED BODY:", body); // Add this line!
        const {
            customerName,
            customerPhone,
            customerEmail,
            date,
            time,
            serviceType,
            notes,
        } = body;

        // Validation
        if (!customerName || !customerPhone || !date || !time || !serviceType) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing required fields',
                },
                { status: 400 }
            );
        }

        // Check if time slot is available
        const existingAppointment = await prisma.appointment.findFirst({
            where: {
                date: new Date(date),
                time: time,
                status: {
                    not: 'CANCELLED',
                },
            },
        });

        if (existingAppointment) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Time slot is not available',
                },
                { status: 409 }
            );
        }

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

        return NextResponse.json(
            {
                success: true,
                data: appointment,
                message: 'Appointment created successfully',
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating appointment:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create appointment',
            },
            { status: 500 }
        );
    }
}
