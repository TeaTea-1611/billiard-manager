import { AppLayout } from "@/components/app-layout";
import { CreateTableDialog } from "@/components/billiard-tables/add-table-dialog";
import { OrderTableSheet } from "@/components/billiard-tables/order-table-sheet";
import { RemoveTableDialog } from "@/components/billiard-tables/remove-table-dialog";
import { UpdateTableDialog } from "@/components/billiard-tables/update-table-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMenuStore } from "@/hooks/use-menu-store";
import { useTableStore } from "@/hooks/use-table-store";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { ReactElement, useEffect } from "react";

export default function Page() {
  const tableStore = useTableStore();

  const menuItemStore = useMenuStore();

  useEffect(() => {
    Promise.all([tableStore.fetchData(), menuItemStore.fetchData()]);
  }, [tableStore.fetchData, menuItemStore.fetchData]);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Bàn billiard</h1>
        <div className="flex items-center gap-2">
          <CreateTableDialog>
            <Button
              size="sm"
              className="text-white bg-primary hover:bg-primary-dark"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Thêm bàn
            </Button>
          </CreateTableDialog>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {tableStore.data.map((table) => (
          <div
            key={table.id}
            className={cn(
              "flex flex-col justify-between h-32 p-3 transition border rounded-lg shadow hover:shadow-md",
              { "outline-primary outline": table.orders?.length },
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold">{table.name}</h3>
              <div className="flex items-center gap-2">
                <UpdateTableDialog initialData={table}>
                  <Button variant="outline" className="h-6 px-2 py-1">
                    <PencilIcon className="mr-2 size-4" />
                    Chỉnh sửa
                  </Button>
                </UpdateTableDialog>
                <RemoveTableDialog tableId={table.id}>
                  <Button variant="destructive" className="size-6">
                    <TrashIcon className="size-4" />
                  </Button>
                </RemoveTableDialog>
              </div>
            </div>
            <p className="flex-1 text-sm text-muted-foreground line-clamp-2">
              Mô tả: {table.description}
            </p>
            <div className="flex items-center justify-between w-full gap-2">
              <div className="flex items-center gap-2">
                <Badge variant={!table.orders?.length ? "outline" : "default"}>
                  {!table.orders?.length
                    ? "Trống"
                    : `Đang chơi ${formatDistanceToNow(
                        new Date(table.orders?.[0].startTime),
                        {
                          locale: vi,
                          addSuffix: true,
                        },
                      )}`}
                </Badge>
                <Badge variant="outline">
                  {table.hourlyRate.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}{" "}
                  / giờ
                </Badge>
              </div>
              <OrderTableSheet table={table}>
                <Button variant="outline" size="sm" className="h-7">
                  {table.orders?.length ? "Chi tiết" : "Đặt bàn"}
                </Button>
              </OrderTableSheet>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
