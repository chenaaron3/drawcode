import '@/styles/globals.css';

import { SessionProvider, signIn, useSession } from 'next-auth/react';
import { Geist } from 'next/font/google';
import { useRouter } from 'next/router';
import { Toaster } from 'sonner';

import MainLayout from '@/components/layout/MainLayout';
import { TutorialOverlay } from '@/components/tutorial';
import { PageLoadingIndicator } from '@/components/ui/PageLoadingIndicator';
import { api } from '@/utils/api';
import { Analytics } from '@vercel/analytics/next';

import type { AppType } from 'next/app';
import type { Session } from 'next-auth';
const geist = Geist({
  subsets: ["latin"],
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <div className={`${geist.className} w-screen h-screen max-w-full max-h-screen overflow-hidden bg-gray-50 flex flex-col`}>
        <Toaster richColors />
        <PageLoadingIndicator />
        <MainLayout />
        <TutorialOverlay />
        <Analytics />
        <div className="flex-1 flex overflow-hidden max-h-full m-4 lg:m-0 lg:pt-16" style={{ height: 'calc(100vh - 4rem)' }}>
          <Component {...pageProps} />
        </div>
      </div>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
