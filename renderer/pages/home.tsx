import { AppLayout } from "@/components/app-layout";
import { ReactElement } from "react";

export default function Page() {
  return <div></div>;
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
