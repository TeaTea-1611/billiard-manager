import { Separator } from "@/components/ui/separator";
import { differenceInHours, differenceInMinutes, format } from "date-fns";
import { useTable } from "../api/use-table";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChangeItemsDialog } from "@/features/items/components/change-items-dialog";
import { useUpdateOrder } from "@/features/orders/api/use-update-order";
import { Input } from "@/components/ui/input";
import { useCreateOrder } from "@/features/orders/api/use-create-order";
import { useRouter } from "next/router";
import { printInvoice } from "@/lib/print-invoice";

interface Props {
  tableId: number;
}

const roundToThousand = (number: number) => {
  return Math.ceil(number / 1000) * 1000;
};

export const TableDetail = ({ tableId }: Props) => {
  const router = useRouter();
  const { data, refetch, isLoading } = useTable(tableId);
  const { mutate: updateOrder, isPending: updateOrderPending } =
    useUpdateOrder();
  const { mutate: createOrder, isPending: createOrderPending } =
    useCreateOrder();
  const [selectedItems, setSelectedItems] = useState<Record<number, number>>(
    {}
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [currentEndTime, setCurrentEndTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentEndTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (data?.data?.bookings[0]) {
      const items = data.data.bookings[0].order.orderItems.reduce<
        Record<number, number>
      >((pre, cur) => {
        pre[cur.itemId] = cur.quantity;
        return pre;
      }, {});
      setSelectedItems(items);
      setPhoneNumber(data.data.bookings[0].order.phoneNumber);
      setCustomerName(data.data.bookings[0].order.customerName);
    }
  }, [data?.data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">Đang tải...</div>
    );
  }

  if (!data?.data?.bookings[0]) {
    return (
      <div className="flex items-center justify-center p-4">
        Không có dữ liệu
      </div>
    );
  }

  const booking = data.data.bookings[0];
  const endTime = booking.endTime ? new Date(booking.endTime) : currentEndTime;
  const startTime = new Date(booking.startTime);

  const totalOrderAmount = roundToThousand(
    booking.order.orderItems.reduce((sum, item) => sum + item.totalAmount, 0)
  );

  const hours = differenceInHours(endTime, startTime);
  const minutes = differenceInMinutes(endTime, startTime) % 60;
  const timeInHours = hours + minutes / 60;

  const tableCharge = roundToThousand(
    Math.ceil(timeInHours * booking.hourlyRate)
  );

  const totalBill = totalOrderAmount + tableCharge;

  const handleUpdateOrder = (items: Record<number, number>) => {
    const orderItems = Object.entries(items)
      .filter(([_, quantity]) => quantity > 0)
      .map(([itemId, quantity]) => ({
        itemId: parseInt(itemId),
        quantity,
      }));

    updateOrder(
      {
        orderId: booking.orderId,
        customerName,
        phoneNumber,
        orderItems: orderItems,
      },
      {
        onSuccess(data) {
          if (data.success) {
            refetch();
          }
        },
      }
    );
  };

  const handleCheckout = () => {
    const orderItems = Object.entries(
      booking.order.orderItems.reduce<Record<number, number>>((pre, cur) => {
        pre[cur.itemId] = cur.quantity;
        return pre;
      }, {})
    )

      .filter(([_, quantity]) => quantity > 0)
      .map(([itemId, quantity]) => ({
        itemId: parseInt(itemId),
        quantity,
      }));

    createOrder(
      {
        orderId: booking.orderId,
        customerName,
        orderItems,
        phoneNumber,
      },
      {
        onSuccess(data) {
          if (data.success && data.data) {
            router.replace("/tables");
            printInvoice({ orderInfo: data.data });
          }
        },
      }
    );
  };

  return (
    <div className="flex flex-col w-full max-w-xl p-4 mx-auto space-y-4 border rounded-lg shadow-md bg-card">
      <h3 className="text-xl font-semibold text-center">Hóa đơn</h3>
      <Separator />
      <div className="space-y-2 text-sm">
        <h4>Thông tin khách hàng</h4>
        <Input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Tên"
        />
        <Input
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Số điện thoại"
        />
      </div>
      <Separator />
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="font-medium">Bàn:</span>
          <span>{booking.tableName}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium">Giá theo giờ:</span>
          <span>{booking.hourlyRate.toLocaleString()}đ/giờ</span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium">Thời gian bắt đầu:</span>
          <span>{format(startTime, "dd/MM/yyyy HH:mm:ss")}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium">Thời gian kết thúc:</span>
          <span>{format(endTime, "dd/MM/yyyy HH:mm:ss")}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium">Tổng thời gian:</span>
          <span>
            {hours} giờ {minutes} phút
          </span>
        </div>

        <div className="flex justify-between font-medium">
          <span>Tiền giờ:</span>
          <span>{tableCharge.toLocaleString()}đ</span>
        </div>
      </div>
      {!!booking.order.orderItems.length && (
        <>
          <Separator />
          <div className="text-sm">
            <h4 className="mb-2 font-medium">Chi tiết đơn hàng:</h4>
            <div className="space-y-2">
              {booking.order.orderItems.map(
                ({ name, price, quantity, totalAmount }) => (
                  <div key={name} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{name}</div>
                      <div className="text-sm text-gray-600">
                        {price.toLocaleString()}đ x {quantity}
                      </div>
                    </div>
                    <div className="font-medium">
                      {roundToThousand(totalAmount).toLocaleString()}đ
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </>
      )}
      <ChangeItemsDialog
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
        onChange={(items) => {
          handleUpdateOrder(items);
        }}
        onClose={() => {
          if (data?.data?.bookings[0]) {
            const items = data.data.bookings[0].order.orderItems.reduce<
              Record<number, number>
            >((pre, cur) => {
              pre[cur.itemId] = cur.quantity;
              return pre;
            }, {});
            setSelectedItems(items);
          }
        }}
      >
        <Button
          variant={"outline"}
          disabled={updateOrderPending || createOrderPending}
        >
          {data.data.bookings[0].order.orderItems.length > 0
            ? "Cập nhật sản phẩm"
            : "Thêm sản phẩm"}
        </Button>
      </ChangeItemsDialog>
      <Separator />
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="font-medium">Tổng tiền đồ:</span>
          <span>{totalOrderAmount.toLocaleString()}đ</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Tiền giờ:</span>
          <span>{tableCharge.toLocaleString()}đ</span>
        </div>
        <div className="flex justify-between text-lg font-semibold">
          <span>Tổng cộng:</span>
          <span>{totalBill.toLocaleString()}đ</span>
        </div>
      </div>
      <Button
        disabled={updateOrderPending || createOrderPending}
        onClick={handleCheckout}
      >
        Thanh toán
      </Button>
    </div>
  );
};
