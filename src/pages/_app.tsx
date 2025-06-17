import '@/styles/globals.css';

import { SessionProvider } from 'next-auth/react';
import { Geist } from 'next/font/google';

import { api } from '@/utils/api';

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
      <div className={geist.className}>
        <Component {...pageProps} />
      </div>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
