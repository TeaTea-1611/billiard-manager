import { AppLayout } from "@/components/app-layout";
import { CreateOrder } from "@/features/orders/components/create-order";
import { ReactElement } from "react";

export default function Page() {
  return <CreateOrder />;
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
