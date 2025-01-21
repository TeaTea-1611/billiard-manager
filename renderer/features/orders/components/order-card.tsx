import React from "react";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { differenceInHours, differenceInMinutes, format } from "date-fns";
import { OrderWithBookingAndOrderItems } from "main/modules/order/order.type";
import { Button } from "@/components/ui/button";
import { printInvoice } from "@/lib/print-invoice";

const roundToThousand = (number: number) => {
  return Math.ceil(number / 1000) * 1000;
};

export const OrderCard = ({
  order,
}: {
  order: OrderWithBookingAndOrderItems;
}) => {
  return (
    <div className="flex flex-col w-full max-w-xl p-4 mx-auto space-y-4 text-sm border rounded-lg shadow-md bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Thông tin hóa đơn #{order.id}</h3>
        <Button
          variant={"outline"}
          size={"sm"}
          className="text-sm"
          onClick={() => {
            printInvoice({ orderInfo: order });
          }}
        >
          In hóa đơn
        </Button>
      </div>
      {(!!order.customerName || !!order.phoneNumber) && (
        <>
          <Separator className="my-2" />
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span className="font-medium">Khách hàng:</span>
              <span>{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Số điện thoại:</span>
              <span>{order.phoneNumber}</span>
            </div>
          </div>
        </>
      )}

      {order.booking && (
        <>
          <Separator className="my-2" />
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span className="font-medium">Bàn:</span>
              <span>{order.booking.tableName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Giá theo giờ:</span>
              <span>{formatCurrency(order.booking.hourlyRate)} / giờ</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Thời gian bắt đầu:</span>
              <span>
                {format(new Date(order.booking.startTime), "HH:mm dd/MM/yyyy")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Thời gian kết thúc:</span>
              <span>
                {format(
                  new Date(order.booking.endTime ?? new Date()),
                  "HH:mm dd/MM/yyyy"
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Tổng thời gian:</span>
              <span>
                {differenceInHours(
                  new Date(order.booking.endTime ?? new Date()),
                  new Date(order.booking.startTime)
                )}{" "}
                giờ{" "}
                {differenceInMinutes(
                  new Date(order.booking.endTime ?? new Date()),
                  new Date(order.booking.startTime)
                ) % 60}{" "}
                phút
              </span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Tổng:</span>
              <span>{formatCurrency(order.booking.totalAmount)}</span>
            </div>
          </div>
        </>
      )}

      {!!order.orderItems.length && (
        <>
          <Separator className="my-2" />
          <table className="w-full text-sm table-auto text-muted-foreground">
            <thead>
              <tr>
                <th className="text-left">Sản phẩm</th>
                <th>Đơn giá</th>
                <th>Số lượng</th>
                <th className="text-right">Tổng</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems.map(
                ({ name, price, quantity, totalAmount }) => (
                  <tr key={name} className="py-1 border-t-2 border-dashed">
                    <td className="font-medium truncate">{name}</td>
                    <td className="text-center">{formatCurrency(price)}</td>
                    <td className="text-center">{quantity}</td>
                    <td className="font-medium text-right">
                      {formatCurrency(roundToThousand(totalAmount))}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
          <div className="flex justify-between font-medium text-muted-foreground">
            <span>Tổng:</span>
            <span>
              {formatCurrency(
                order.totalAmount - (order.booking?.totalAmount || 0)
              )}
            </span>
          </div>
        </>
      )}

      <Separator className="my-2" />
      <div className="space-y-2">
        <div className="flex justify-between text-lg font-semibold">
          <span>Tổng tất cả:</span>
          <span>{formatCurrency(order.totalAmount)}</span>
        </div>
        {!!order.payedAt && (
          <div className="text-xs text-right text-muted-foreground">
            Thanh toán lúc:{" "}
            {format(new Date(order.payedAt), "HH:mm dd/MM/yyyy")}
          </div>
        )}
      </div>
    </div>
  );
};
