import type { AppProps } from "next/app";
import { Fragment, ReactElement, ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import "../styles/globals.css";
import { NextPage } from "next";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <Fragment>
      {getLayout(<Component {...pageProps} />)}
      <Toaster />
    </Fragment>
  );
}

export default MyApp;
