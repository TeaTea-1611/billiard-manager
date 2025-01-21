import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Plus, Minus, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { useItems } from "@/features/items/api/use-items";
import { useCreateOrder } from "../api/use-create-order";
import { printInvoice } from "@/lib/print-invoice";

type OrderItem = {
  itemId: number;
  quantity: number;
};

type OrderFormData = {
  customerName: string;
  phoneNumber: string;
  orderItems: OrderItem[];
};

export const CreateOrder = () => {
  const { data: itemsData } = useItems();
  const [selectedItems, setSelectedItems] = useState<Record<number, number>>(
    {}
  );
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const { mutate, isPending } = useCreateOrder();

  const createOrder = async ({
    customerName,
    phoneNumber,
    orderItems,
  }: OrderFormData) => {
    mutate(
      {
        customerName,
        orderItems,
        phoneNumber,
      },
      {
        onSuccess(data, variables, context) {
          if (data.data) {
            printInvoice({ orderInfo: data.data });
          }
        },
      }
    );
    resetForm();
  };

  const resetForm = () => {
    setSelectedItems({});
    setCustomerName("");
    setPhoneNumber("");
  };

  const handleQuantityChange = (itemId: number, quantity: string) => {
    const numQuantity = parseInt(quantity) || 0;
    if (numQuantity >= 0) {
      setSelectedItems((prev) => ({
        ...prev,
        [itemId]: numQuantity,
      }));
    }
  };

  const incrementQuantity = (itemId: number) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  const decrementQuantity = (itemId: number) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: Math.max((prev[itemId] || 0) - 1, 0),
    }));
  };

  const calculateTotal = (price: number, quantity: number) => {
    return price * quantity;
  };

  const calculateOrderTotal = () => {
    return (
      itemsData?.data?.reduce((total, item) => {
        const quantity = selectedItems[item.id] || 0;
        return total + item.price * quantity;
      }, 0) || 0
    );
  };

  const handleSubmitOrder = () => {
    const orderItems = Object.entries(selectedItems)
      .filter(([_, quantity]) => quantity > 0)
      .map(([itemId, quantity]) => ({
        itemId: parseInt(itemId),
        quantity,
      }));

    if (orderItems.length === 0) {
      toast.error("Vui lòng chọn sản phẩm.");
      return;
    }

    createOrder({
      customerName,
      phoneNumber,
      orderItems,
    });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full p-4 border rounded-lg bg-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Hóa đơn</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={resetForm}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Làm mới
          </Button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">
              Tên khách hàng
            </label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nhập tên khách hàng"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">
              Số điện thoại
            </label>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Nhập số điện thoại"
            />
          </div>
          <div className="pt-4 border-t">
            <div className="flex justify-between mb-4 font-semibold">
              <span>Tổng cộng:</span>
              <span>{calculateOrderTotal().toLocaleString()} VND</span>
            </div>
            <div className="space-y-2">
              <Button
                onClick={handleSubmitOrder}
                className="w-full"
                disabled={isPending}
              >
                Tạo hóa đơn
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full p-4 border rounded-lg bg-card">
        <Table>
          <TableCaption>Sản phẩm</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-28">Tên</TableHead>
              <TableHead>Số lượng</TableHead>
              <TableHead>Đơn giá</TableHead>
              <TableHead className="text-right">Tổng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itemsData?.data?.map((item) => (
              <TableRow key={item.id} className="text-xs">
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-6"
                      onClick={() => decrementQuantity(item.id)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      min="0"
                      value={selectedItems[item.id] || ""}
                      onChange={(e) =>
                        handleQuantityChange(item.id, e.target.value)
                      }
                      className="w-20 h-6 text-center"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-6"
                      onClick={() => incrementQuantity(item.id)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>{formatCurrency(item.price)}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(
                    calculateTotal(item.price, selectedItems[item.id] || 0)
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
