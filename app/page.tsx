'use client';
import { Waitlist } from '@clerk/nextjs'
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex flex-col gap-4 max-w-2xl text-center sm:text-left">
          <Link href="/home" className="text-2xl font-bold leading-tight sm:text-xl">
          Home
          </Link>
        </div>
      <Waitlist />
      </main>
    </div>
  );
}
