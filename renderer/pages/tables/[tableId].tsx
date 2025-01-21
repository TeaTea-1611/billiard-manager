import { AppLayout } from "@/components/app-layout";
import { CreateTable } from "@/features/tables/components/create-table";
import { TableDetail } from "@/features/tables/components/table";
import { Tables } from "@/features/tables/components/tables";
import { useRouter } from "next/router";
import { ReactElement } from "react";

export default function Page() {
  const router = useRouter();

  if (typeof router.query.tableId !== "string") {
    return <p></p>;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div></div>
      </div>
      <TableDetail tableId={parseInt(router.query.tableId)} />
    </>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
