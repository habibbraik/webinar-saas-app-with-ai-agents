import { registerAttendee } from '@/actions/attendance';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAttendeeStore } from '@/store/useAttendeeStore';
import { WebinarStatusEnum } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { toast } from 'sonner';

type Props = {
    webinarId: string;
    webinarStatus: WebinarStatusEnum;
    onRegistered?: () => void;
}

const WaitListComponent = ({
    webinarId,
    webinarStatus,
    onRegistered
}: Props) => {

    const [isopen, setIsopen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const router = useRouter();

    const { setAttendee } = useAttendeeStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(false);
        try {
            const res = await registerAttendee({
                email,
                name,
                webinarId,
            })

            if (!res.success) {
                throw new Error(res.message || 'Registration failed');
            }

            if (res.data?.attendee) {
                setAttendee(res.data.attendee)
            }
            toast.success(
                webinarStatus === WebinarStatusEnum.LIVE
                    ? 'Successfully joined the webinar!'
                    : 'Successfully joined the waitlist!'
            );
            setEmail('');
            setName('');
            setSubmitted(true);
            setTimeout(() => {
                setIsopen(false);
                if (webinarStatus === WebinarStatusEnum.LIVE) {
                    router.refresh();
                }
                if (onRegistered) onRegistered();
            }, 1500);

        } catch (error) {
            console.error('Error submitting waitlist form:', error);
            toast.error(
                error instanceof Error ? error.message : 'An unexpected error occurred.'
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    const buttonText = () => {
        switch (webinarStatus) {
            case WebinarStatusEnum.SCHEDULED:
                return 'Get Reminder'
            case WebinarStatusEnum.WAITING_ROOM:
                return 'Get Reminder'
            case WebinarStatusEnum.LIVE:
                return 'Join Webinar'
            default:
                return 'Register'
        }
    }

    return (
        <Dialog
            open={isopen}
            onOpenChange={setIsopen}
        >
            <DialogTrigger asChild>
                <Button
                    className={`
    ${webinarStatus === WebinarStatusEnum.LIVE
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-primary hover:bg-primary/90'
                        } rounded-md px-4 py-2 text-primary-foreground text-sm font-semibold`
                    }
                >
                    {webinarStatus === WebinarStatusEnum.LIVE && (
                        <span className="mr-2 h-2 w-2 bg-white rounded-full animate-pulse"></span>
                    )}
                    {buttonText()}
                </Button>
            </DialogTrigger>
            <DialogContent
                className="border-0 bg-transparent"
                isHideCloseButton={true}
            >
                <DialogHeader className="justify-center items-center border border-input rounded-xl p-4 bg-background">
                    <DialogTitle className="text-center text-lg font-semibold mb-4">
                        {webinarStatus === WebinarStatusEnum.LIVE
                            ? 'Join the Webinar'
                            : 'Join the Waitlist'
                        }
                    </DialogTitle>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                        {!submitted && (
                            <React.Fragment>
                                <Input
                                    type="text"
                                    placeholder="Your Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                                <Input
                                    type="email"
                                    placeholder="Your Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </React.Fragment>
                        )}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting || submitted}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" />
                                    {webinarStatus === WebinarStatusEnum.LIVE
                                        ? 'Joining...'
                                        : 'Registering...'}
                                </>
                            ) : submitted ? (
                                webinarStatus === WebinarStatusEnum.LIVE ? (
                                    "You're all set to join!"
                                ) : (
                                    "You've successfully joined the waitlist!"
                                )
                            ) : webinarStatus === WebinarStatusEnum.LIVE ? (
                                'Join Now'
                            ) : (
                                'Join waitlist'
                            )}
                        </Button>
                    </form>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

export default WaitListComponent