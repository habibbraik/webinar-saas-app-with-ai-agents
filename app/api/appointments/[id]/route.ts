import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';

// GET /api/appointments/[id] - Get single appointment
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const appointment = await prisma.appointment.findUnique({
            where: { id },
        });

        if (!appointment) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Appointment not found',
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: appointment,
        });
    } catch (error) {
        console.error('Error fetching appointment:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch appointment',
            },
            { status: 500 }
        );
    }
}

// PATCH /api/appointments/[id] - Update appointment
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        // Check if appointment exists
        const existingAppointment = await prisma.appointment.findUnique({
            where: { id },
        });

        if (!existingAppointment) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Appointment not found',
                },
                { status: 404 }
            );
        }

        // If updating date/time, check availability
        if (body.date || body.time) {
            const checkDate = body.date
                ? new Date(body.date)
                : existingAppointment.date;
            const checkTime = body.time || existingAppointment.time;

            const conflictingAppointment = await prisma.appointment.findFirst({
                where: {
                    id: { not: id },
                    date: checkDate,
                    time: checkTime,
                    status: { not: 'CANCELLED' },
                },
            });

            if (conflictingAppointment) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Time slot is not available',
                    },
                    { status: 409 }
                );
            }
        }

        const updateData: any = {};

        if (body.customerName !== undefined) updateData.customerName = body.customerName;
        if (body.customerPhone !== undefined) updateData.customerPhone = body.customerPhone;
        if (body.customerEmail !== undefined) updateData.customerEmail = body.customerEmail;
        if (body.date !== undefined) updateData.date = new Date(body.date);
        if (body.time !== undefined) updateData.time = body.time;
        if (body.serviceType !== undefined) updateData.serviceType = body.serviceType;
        if (body.status !== undefined) updateData.status = body.status;
        if (body.notes !== undefined) updateData.notes = body.notes;

        const appointment = await prisma.appointment.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({
            success: true,
            data: appointment,
            message: 'Appointment updated successfully',
        });
    } catch (error) {
        console.error('Error updating appointment:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to update appointment',
            },
            { status: 500 }
        );
    }
}

// DELETE /api/appointments/[id] - Cancel appointment
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Check if appointment exists
        const existingAppointment = await prisma.appointment.findUnique({
            where: { id },
        });

        if (!existingAppointment) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Appointment not found',
                },
                { status: 404 }
            );
        }

        // Update status to CANCELLED instead of deleting
        const appointment = await prisma.appointment.update({
            where: { id },
            data: {
                status: 'CANCELLED',
            },
        });

        return NextResponse.json({
            success: true,
            data: appointment,
            message: 'Appointment cancelled successfully',
        });
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to cancel appointment',
            },
            { status: 500 }
        );
    }
}
