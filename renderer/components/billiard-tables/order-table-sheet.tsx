import { useState } from "react";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { PlaySession, Table } from "@prisma/client";

export function OrderTableSheet({
  children,
  table,
}: {
  children: React.ReactNode;
  table: Table & {
    isAvailable: boolean;
    playSessions: PlaySession[];
  };
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    setIsLoading(true);
    window.ipc.send("create-play-session", { tableId: table.id });
    setIsLoading(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Đặt bàn</SheetTitle>
          <SheetDescription>
            {table.isAvailable
              ? "Bàn hiện đang trống. Bạn có thể đặt bàn ngay."
              : "Bàn hiện đang được sử dụng. Chi tiết phiên chơi:"}
          </SheetDescription>
        </SheetHeader>
        {table.isAvailable ? (
          <Button
            type="button"
            className="w-full"
            disabled={isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? "Đang tải..." : "Xác nhận đặt bàn"}
          </Button>
        ) : (
          <div className="mt-4">
            <p>
              <strong>Trạng thái:</strong>{" "}
              {table.playSessions[0].status === 1 ? "Đang sử dụng" : "Khác"}{" "}
              {/* Điều chỉnh trạng thái */}
            </p>
            <p>
              <strong>Bắt đầu lúc:</strong>{" "}
              {new Date(table.playSessions[0].startTime).toLocaleString(
                "vi-VN",
              )}
            </p>
            {table.playSessions[0].endTime && (
              <p>
                <strong>Kết thúc dự kiến:</strong>{" "}
                {new Date(table.playSessions[0].endTime).toLocaleString(
                  "vi-VN",
                )}
              </p>
            )}
            <p>
              <strong>Thanh toán:</strong>{" "}
              {table.playSessions[0].isPaid
                ? "Đã thanh toán"
                : "Chưa thanh toán"}
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
