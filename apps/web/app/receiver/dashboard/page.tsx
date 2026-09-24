'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ReceiverDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/ngo/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d6a4f]"></div>
    </div>
  );
}
