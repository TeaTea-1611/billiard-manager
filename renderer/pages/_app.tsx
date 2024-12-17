import type { AppProps } from "next/app";
import { Fragment, ReactElement, ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import "../styles/globals.css";
import { NextPage } from "next";
import { ThemeProvider } from "@/components/theme-provider";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div
        id="titlebar"
        className="flex items-center px-2 border-b h-9 bg-card"
      >
        <span className="text-sm font-semibold">Billiard Manager</span>
      </div>
      <div className="h-[calc(100vh-36px)] overflow-auto">
        {getLayout(<Component {...pageProps} />)}
      </div>
      <Toaster />
    </ThemeProvider>
  );
}

export default MyApp;
