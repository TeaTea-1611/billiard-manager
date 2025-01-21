import { AppLayout } from "@/components/app-layout";
import { Separator } from "@/components/ui/separator";
import { CreateTable } from "@/features/tables/components/create-table";
import { Tables } from "@/features/tables/components/tables";
import { ReactElement } from "react";

export default function Page() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Bàn Billiard</h1>
        <CreateTable />
      </div>
      <Tables />
    </>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
