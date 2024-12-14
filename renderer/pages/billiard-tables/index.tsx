import { AppLayout } from "@/components/app-layout";
import { CreateTableDialog } from "@/components/billiard-tables/add-table-dialog";
import { RemoveTableDialog } from "@/components/billiard-tables/remove-table-dialog";
import { UpdateTableDialog } from "@/components/billiard-tables/update-table-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table } from "@prisma/client";
import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { ReactElement, useEffect, useState } from "react";

export default function Page() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.ipc.on("tables", (tables: Table[]) => {
      setTables(tables);
    });

    window.ipc.send("get-tables", null);

    setLoading(false);
  }, []);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Danh sách</h1>
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {loading
          ? [...Array(10)].map((_, i) => <Skeleton key={i} className="h-32" />)
          : tables.map((table) => (
              <div
                key={table.id}
                className="flex flex-col justify-between h-32 p-3 transition border rounded-lg shadow hover:shadow-md"
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
                  <Badge variant="outline">
                    {table.hourlyRate.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}{" "}
                    / giờ
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Ngày tạo:{" "}
                    {new Date(table.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
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
