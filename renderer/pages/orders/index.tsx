import { AppLayout } from "@/components/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { printInvoice } from "@/helpers/print-invoice";
import { formatCurrency } from "@/lib/utils";
import { MenuItem, Order, OrderItem, Table as TableType } from "@prisma/client";
import { formatDate } from "date-fns";
import { PrinterIcon } from "lucide-react";
import { ReactElement, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

const PAGE_SIZE = 20;

export default function Page() {
  const [orders, setOrders] = useState<
    (Order & {
      table?: TableType;
      orderItems: (OrderItem & {
        menuItem: MenuItem;
      })[];
    })[]
  >([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView();

  const fetchOrders = async (currentPage: number) => {
    try {
      const response = await window.ipc.invoke("get-orders", {
        page: currentPage,
        pageSize: PAGE_SIZE,
      });

      if (response.data.length > 0) {
        // Append new orders to existing orders
        setOrders((prevOrders) => [...prevOrders, ...response.data]);

        // Check if there are more orders to load
        setHasMore(response.data.length === PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setHasMore(false);
    }
  };

  useEffect(() => {
    // Fetch initial orders
    fetchOrders(1);
  }, []);

  useEffect(() => {
    // Load more orders when scrolled to the bottom and more orders exist
    if (inView && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchOrders(nextPage);
    }
  }, [inView, hasMore]);

  const calculateTableRent = (startTime: Date, hourlyRate: number) => {
    const minutesDiff = Math.abs(
      (new Date().getTime() - startTime.getTime()) / (1000 * 60),
    );

    const rent = (minutesDiff / 60) * hourlyRate;

    return Math.ceil(rent / 1000) * 1000;
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Hóa đơn</h1>
        <div className="flex items-center gap-2"></div>
      </div>
      <div>
        <div className="grid gap-4 mt-4">
          {orders.map((order, index) => (
            <div
              key={order.id}
              ref={index === orders.length - 1 ? ref : null}
              className="flex flex-col justify-between gap-2 p-3 transition border rounded-lg shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">ID: {order.id}</h2>
                {order.isPaid && (
                  <Button className="h-7" onClick={() => printInvoice(order)}>
                    <PrinterIcon />
                    In hóa đơn
                  </Button>
                )}
              </div>
              {!!order.table && (
                <div className="flex flex-col gap-2">
                  <h4 className="font-medium">Bàn: {order.table.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Phiên chơi:{" "}
                    {formatDate(new Date(order.startTime), "pp dd/MM/yy")}
                    {" - "}
                    {order.endTime ? (
                      <>
                        {formatDate(new Date(order.endTime), "pp dd/MM/yy")}
                        <br />
                        Thành tiền: {formatCurrency(order.amountTable)}
                      </>
                    ) : (
                      <>
                        {formatDate(new Date(), "pp dd/MM/yy")}
                        <br />
                        Thành tiền:{" "}
                        {formatCurrency(
                          calculateTableRent(
                            new Date(order.startTime),
                            order.table.hourlyRate,
                          ),
                        )}
                      </>
                    )}
                  </p>
                </div>
              )}
              {!!order.orderItems.length && (
                <Table className="text-xs">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên</TableHead>
                      <TableHead>Số lượng</TableHead>
                      <TableHead>Đơn giá</TableHead>
                      <TableHead className="text-right">Tổng</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.orderItems.map((item) => (
                      <TableRow key={item.menuItemId}>
                        <TableCell className="font-medium">
                          {item.menuItem.name}
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          {formatCurrency(item.menuItem.price)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.subtotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <div className="flex items-center justify-between w-full gap-2">
                <div className="flex items-center gap-2">
                  {order.isPaid && (
                    <Badge variant="outline" className="px-4 py-2">
                      Tổng: {formatCurrency(order.totalAmount)}
                    </Badge>
                  )}
                  <Badge
                    variant={order.isPaid ? "outline" : "destructive"}
                    className="px-4 py-2"
                  >
                    {order.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  Ngày tạo:{" "}
                  {formatDate(new Date(order.createdAt), "pp dd/MM/yy")}
                </span>
              </div>
            </div>
          ))}

          {!hasMore && orders.length > 0 && (
            <div className="py-4 text-center text-muted-foreground">
              Không còn hóa đơn để hiển thị
            </div>
          )}
        </div>
      </div>
    </>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
