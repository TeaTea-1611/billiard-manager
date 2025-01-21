import { AppLayout } from "@/components/app-layout";
import { Orders } from "@/features/orders/components/orders";
import { ReactElement } from "react";

export default function Page() {
  return <Orders />;
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
