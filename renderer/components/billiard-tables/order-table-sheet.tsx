import { Data, useTableStore } from "@/hooks/use-table-store";
import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { MenuItem } from "@prisma/client";
import { useMenuStore } from "@/hooks/use-menu-store";
import { Input } from "../ui/input";
import { formatCurrency } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import MenuItemsDialog from "../menu-items/menu-items-dialog";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { printInvoice } from "@/helpers/print-invoice";

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

export function OrderTableSheet({
  children,
  table,
}: {
  children: React.ReactNode;
  table: Data;
}) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [orderItems, setOrderItems] = useState(
    table.orders?.[0]?.orderItems || [],
  );
  const { updateData } = useTableStore();
  const [editing, setEditing] = useState(!table.orders?.length);

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity >= 0) {
      setOrderItems((pre) =>
        pre
          .map((item) =>
            item.menuItemId === id
              ? { ...item, quantity, subtotal: quantity * item.menuItem.price }
              : item,
          )
          .filter((item) => item.quantity > 0),
      );
    }
  };

  const addMenuItem = (menuItem: MenuItem) => {
    const orderId = table.orders?.[0]?.id;

    setOrderItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.menuItemId === menuItem.id,
      );
      if (existingItem) {
        return prevItems.map((item) =>
          item.menuItemId === menuItem.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.menuItem.price,
              }
            : item,
        );
      } else {
        return [
          ...prevItems,
          {
            menuItem,
            orderId,
            menuItemId: menuItem.id,
            quantity: 1,
            subtotal: menuItem.price,
          },
        ];
      }
    });
  };

  const totalOrderItemsAmount = useMemo(() => {
    return orderItems.reduce((total, item) => total + item.subtotal, 0);
  }, [orderItems]);

  const handleOrder = async () => {
    setLoading(true);
    const result = await window.ipc.invoke("create-order", {
      tableId: table.id,
      menuItems: orderItems.map((order) => ({
        ...order.menuItem,
        quantity: order.quantity,
      })),
    });
    toast[result.success ? "success" : "error"](result.message);
    if (result.data) {
      updateData({
        ...table,
        orders: [result.data],
      });
    }
    setLoading(false);
    if (result.success) {
      setOpen(false);
      setEditing(false);
    }
  };

  const handleUpdateOrder = async () => {
    const orderId = table.orders?.[0]?.id;
    if (!orderId) return;

    setLoading(true);
    const result = await window.ipc.invoke("update-order", {
      orderId,
      menuItems: orderItems.map((order) => ({
        ...order.menuItem,
        quantity: order.quantity,
      })),
    });
    toast[result.success ? "success" : "error"](result.message);
    if (result.data) {
      updateData({
        ...table,
        orders: [result.data],
      });
    }
    setLoading(false);
    if (result.success) {
      setEditing(false);
    }
  };

  const handleCheckoutOrder = async () => {
    const orderId = table.orders?.[0]?.id;
    if (!orderId) return;

    setLoading(true);
    const result = await window.ipc.invoke("checkout-order", { orderId });
    toast[result.success ? "success" : "error"](result.message);
    if (result.success) {
      updateData({
        ...table,
        orders: [],
      });
    }
    setLoading(false);
    if (result.success && result.data) {
      printInvoice(result.data);
      setOpen(false);
      setEditing(true);
      setOrderItems([]);
    }
  };

  const calculateTableRent = (startTime: Date, hourlyRate: number) => {
    const minutesDiff = Math.abs(
      (new Date().getTime() - startTime.getTime()) / (1000 * 60),
    );

    const rent = (minutesDiff / 60) * hourlyRate;

    return Math.ceil(rent / 1000) * 1000;
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full flex flex-col md:max-w-[50%]" side="left">
        <SheetHeader>
          <SheetTitle>Đặt bàn: {table.name}</SheetTitle>
          <SheetDescription>
            Giá bàn: {formatCurrency(table.hourlyRate)} / giờ
            <br />
            {table.orders?.length &&
              `Ước tính: ${formatCurrency(
                calculateTableRent(
                  new Date(table.orders[0].startTime),
                  table.hourlyRate,
                ),
              )} - ${formatDistanceToNow(new Date(table.orders[0].startTime), {
                locale: vi,
                addSuffix: true,
              })}`}
            <br />
            {!!orderItems.length &&
              `Tổng giá sản phẩm: ${formatCurrency(totalOrderItemsAmount)}`}
            <br />
            Tổng tiền:{" "}
            {table.orders?.length &&
              formatCurrency(
                calculateTableRent(
                  new Date(table.orders[0].startTime),
                  table.hourlyRate,
                ) + totalOrderItemsAmount,
              )}
            <br />
          </SheetDescription>
        </SheetHeader>
        <div className="flex items-center gap-2">
          {editing ? (
            <MenuItemsDialog selectMenuItem={(item) => addMenuItem(item)}>
              <Button variant="outline" size="sm">
                Thêm sản phẩm
              </Button>
            </MenuItemsDialog>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
            >
              Chỉnh sửa
            </Button>
          )}
        </div>
        <div className="flex-1">
          <Table className="text-xs">
            <TableCaption>Sản phẩm</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead>Số lượng</TableHead>
                <TableHead>Đơn giá</TableHead>
                <TableHead className="text-right">Tổng</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderItems.map((item) => (
                <TableRow key={item.menuItemId}>
                  <TableCell className="font-medium">
                    {item.menuItem.name}
                  </TableCell>
                  <TableCell>
                    {editing ? (
                      <div className="flex items-center h-6 space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateQuantity(item.menuItemId, item.quantity - 1)
                          }
                          className="size-6"
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(
                              item.menuItemId,
                              parseInt(e.target.value) || 0,
                            )
                          }
                          className="h-6 text-center w-14"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="size-6"
                          onClick={() =>
                            updateQuantity(item.menuItemId, item.quantity + 1)
                          }
                        >
                          +
                        </Button>
                      </div>
                    ) : (
                      item.quantity
                    )}
                  </TableCell>
                  <TableCell>{formatCurrency(item.menuItem.price)}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.subtotal)}
                  </TableCell>
                </TableRow>
              ))}
              {orderItems.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    Chưa có sản phẩm nào được chọn
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <SheetFooter>
          {table.orders?.length ? (
            editing ? (
              <Button
                type="button"
                className="w-full"
                onClick={handleUpdateOrder}
                disabled={loading}
              >
                Lưu thay đổi
              </Button>
            ) : (
              <Button
                type="button"
                className="w-full"
                disabled={loading}
                onClick={handleCheckoutOrder}
              >
                Thanh toán
              </Button>
            )
          ) : (
            <Button
              type="button"
              className="w-full"
              onClick={handleOrder}
              disabled={loading}
            >
              Xác nhận đặt bàn
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
