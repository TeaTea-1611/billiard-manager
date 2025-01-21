import React from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { PencilIcon, TrashIcon } from "lucide-react";
import { UpdateTable } from "./update-table";
import { RemoveTable } from "./remove-table";
import { BookingTable } from "./booking-table";
import Link from "next/link";
import { useTables } from "../api/use-tables";

export const Tables = () => {
  const { data } = useTables();

  return (
    <div className="grid grid-cols-2 gap-4">
      {data?.data?.map((table) => (
        <div
          key={table.id}
          className={cn(
            "relative bg-card flex flex-col justify-between h-40 transition border rounded-lg shadow hover:shadow-md",
            { "outline-primary outline": table.bookings.length }
          )}
        >
          <div className="flex justify-between gap-2 px-2 py-1 border-b">
            <div className="flex items-center gap-2">
              <div
                className={cn("py-0.5 px-1 text-xs border rounded-lg", {
                  "bg-primary text-primary-foreground": table.bookings.length,
                })}
              >
                {table.bookings.length ? "Đang chơi" : "Trống"}
              </div>
              <div className="py-0.5 px-1 text-xs border rounded-lg">
                {formatCurrency(table.hourlyRate)} / giờ
              </div>
            </div>
            <div className="flex items-center gap-2">
              <UpdateTable initialData={table}>
                <Button variant="outline" className="h-6 px-2 py-1">
                  <PencilIcon className="mr-2 size-4" />
                  Chỉnh sửa
                </Button>
              </UpdateTable>
              <RemoveTable tableId={table.id}>
                <Button variant="destructive" className="size-6">
                  <TrashIcon className="size-4" />
                </Button>
              </RemoveTable>
            </div>
          </div>
          <div className="flex items-center justify-center flex-1">
            <span className="text-xl font-semibold">{table.name}</span>
          </div>

          {table.bookings.length ? (
            <Link
              href={`/tables/${table.id}`}
              className={cn(
                buttonVariants({
                  size: "sm",
                }),
                "absolute h-6 bottom-2 right-2 text-xs"
              )}
            >
              Chi tiết
            </Link>
          ) : (
            <BookingTable tableId={table.id}>
              <Button
                variant="outline"
                size="sm"
                className="absolute h-6 text-xs bottom-2 right-2"
              >
                Đặt bàn
              </Button>
            </BookingTable>
          )}
        </div>
      ))}
    </div>
  );
};
