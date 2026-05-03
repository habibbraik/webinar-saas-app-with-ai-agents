'use server';
import { AttendanceData } from '@/lib/type';
import { AttendanceStatusEnum as AttendedTypeEnum, CtaTypeEnum } from '@prisma/client';
import { prisma as prismaClient } from '@/lib/prismaClient';
import { revalidatePath } from 'next/cache';
import { create } from 'domain';

export const getWebinarAttendance = async (
    webinarId: string,
    options: {
        includeUsers?: boolean
        userLimit?: number
    } = { includeUsers: true, userLimit: 100 }
) => {
    try {
        const webinar = await prismaClient.webinar.findUnique({
            where: { id: webinarId },
            select: {
                id: true,
                ctaType: true,
                presenter: true,
                tags: true,
                _count: {
                    select: {
                        attendances: true,
                    },
                },
            },
        });

        if (!webinar) {
            return {
                success: false,
                status: 404,
                error: 'Webinar not found',
            }
        }

        const attendanceCounts = await prismaClient.attendance.groupBy({
            by: ['status'],
            where: {
                webinarId,
            },
            _count: true,
        });

        const result: Record<AttendedTypeEnum, AttendanceData> = {} as
            Record<
                AttendedTypeEnum,
                AttendanceData
            >;

        for (const type of Object.values(AttendedTypeEnum)) {
            if (
                type === AttendedTypeEnum.ADDED_TO_CART &&
                webinar.ctaType !== CtaTypeEnum.BOOK_A_CALL
            ) {
                continue;
            }

            if (
                type === AttendedTypeEnum.BREAK_OUT_ROOM &&
                webinar.ctaType !== CtaTypeEnum.BOOK_A_CALL
            ) {
                continue;
            }

            const countItem = attendanceCounts.find((item) => {
                if (
                    webinar.ctaType === CtaTypeEnum.BOOK_A_CALL &&
                    type === AttendedTypeEnum.BREAK_OUT_ROOM &&
                    item.status === AttendedTypeEnum.ADDED_TO_CART
                ) {
                    return true
                }
                return item.status === type
            })

            result[type] = {
                count: countItem ? (countItem._count as number) : 0,
                users: [],
            }
        }

        if (options.includeUsers) {
            for (const type of Object.values(AttendedTypeEnum)) {
                if (
                    (
                        type === AttendedTypeEnum.ADDED_TO_CART &&
                        webinar.ctaType !== CtaTypeEnum.BOOK_A_CALL
                    ) || (
                        type === AttendedTypeEnum.BREAK_OUT_ROOM &&
                        webinar.ctaType !== CtaTypeEnum.BOOK_A_CALL
                    )
                ) {
                    continue;
                }
                const queryType =
                    webinar.ctaType === CtaTypeEnum.BOOK_A_CALL &&
                        type === AttendedTypeEnum.BREAK_OUT_ROOM
                        ? AttendedTypeEnum.ADDED_TO_CART
                        : type;

                if (result[type].count > 0) {
                    const attendees = await prismaClient.attendance.findMany({
                        where: {
                            webinarId,
                            status: queryType,
                        },
                        include: {
                            attendee: true,
                        },
                        take: options.userLimit,
                        orderBy: {
                            registeredAt: 'desc',
                        },
                    });

                    result[type].users = attendees.map((attendance: any) => ({
                        id: attendance.attendee.id,
                        name: attendance.attendee.name,
                        email: attendance.attendee.email,
                        attendedAt: attendance.attendedAt || attendance.registeredAt,
                        stripeConnectId: null,
                        callStatus: attendance.attendee.callStatus,
                        createdAt: attendance.attendee.createdAt,
                        updatedAt: attendance.attendee.updatedAt,
                    })) as any;
                }
            }
        }

        // revalidatePath(`/webinars/${webinarId}/pipelines`);
        return {
            success: true,
            data: result,
            ctaTypeEnum: webinar.ctaType,
            webinarTags: webinar.tags || [],
            presenter: webinar.presenter,
        }
    } catch (error) {
        console.error('Error fetching webinar attendance:', error)
        return {
            success: false,
            status: 500,
            error: 'Internal Server Error',
        }
    }
}

export const registerAttendee = async ({
    webinarId,
    email,
    name,
}: {
    webinarId: string
    email: string
    name: string
}) => {
    try {
        if (!webinarId || !email) {
            return {
                success: false,
                status: 400,
                message: 'Missing required parameters',
            }
        }

        const webinar = await prismaClient.webinar.findUnique({
            where: { id: webinarId },
        })

        if (!webinar) {
            return { success: false, status: 404, message: 'webinar not found' }
        }

        let attendee = await prismaClient.attendee.findUnique({
            where: { email },
        })

        if (!attendee) {
            attendee = await prismaClient.attendee.create({
                data: { email, name },
            })
        }

        const existingAttendance = await prismaClient.attendance.findFirst({
            where: {
                attendeeId: attendee.id,
                webinarId: webinarId,
            },
            include: {
                attendee: true,
            },
        })

        if (existingAttendance) {
            return {
                success: true,
                status: 200,
                data: existingAttendance,
                message: 'Attendee already registered for this webinar',
            }
        }

        const attendance = await prismaClient.attendance.create({
            data: {
                status: AttendedTypeEnum.REGISTERED,
                attendeeId: attendee.id,
                webinarId: webinarId,
            },
            include: {
                attendee: true,
            },
        });

        revalidatePath(`/${webinarId}`);

        return {
            success: true,
            status: 201,
            data: attendance,
            message: 'Attendee registered successfully',
        }
    } catch (error) {
        console.error('Error registering attendee:', error)
        return {
            success: false,
            status: 500,
            error: 'Error registering attendee',
            message: 'Internal Server Error',
        }
    }
}

export const changeAttendanceType = async (
    attendeeId: string,
    webinarId: string,
    attendedType: AttendedTypeEnum
) => {
    try {
        const existingAttendance = await prismaClient.attendance.findFirst({
            where: {
                attendeeId,
                webinarId,
            },
        });

        if (!existingAttendance) {
            return {
                success: false,
                status: 404,
                message: 'Attendance not found',
            };
        }

        const attendance = await prismaClient.attendance.update({
            where: {
                id: existingAttendance.id,
            },
            data: {
                status: attendedType,
            },
        });

        return {
            success: true,
            status: 200,
            data: attendance,
            message: 'Attendance type updated successfully',
        };
    }
        catch (error) {
            console.error('Error updating attendance type:', error);
            return {
                success: false,
                status: 500,
                message: 'Internal Server Error',
                error,
            };
        }
    }