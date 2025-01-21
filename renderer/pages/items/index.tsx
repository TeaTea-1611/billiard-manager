import { AppLayout } from "@/components/app-layout";
import { CreateItem } from "@/features/items/components/create-item";
import { Items } from "@/features/items/components/items";
import { ReactElement } from "react";

export default function Page() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Sản phẩm & Dịch vụ</h2>
        <CreateItem />
      </div>
      <Items />
    </>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
