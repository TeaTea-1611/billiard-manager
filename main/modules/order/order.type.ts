import { Booking, Order, OrderItem } from "@prisma/client";
import { ApiResponsePromise } from "../../types/api-response";

export type OrderWithBookingAndOrderItems = Order & {
  booking?: Booking | null;
  orderItems: OrderItem[];
};

export interface CreateOrderArgs {
  orderId?: number;
  customerName: string;
  phoneNumber: string;
  orderItems: {
    itemId: number;
    quantity: number;
  }[];
}

export interface UpdateOrderArgs {
  orderId: number;
  customerName: string;
  phoneNumber: string;
  orderItems: {
    itemId: number;
    quantity: number;
  }[];
}

export interface OrdersArgs {
  page: number;
  take: number;
}

export type OrderResponse = ApiResponsePromise<OrderWithBookingAndOrderItems>;
export type OrdersResponse = Promise<{
  data?: OrderWithBookingAndOrderItems[];
  success: boolean;
  message: string;
  nextPage?: number | null;
  previousPage?: number | null;
}>;

export interface OrderApi {
  orders(args: OrdersArgs): OrdersResponse;
  getAllOrders(): ApiResponsePromise<Order[]>;
  create(args: CreateOrderArgs): OrderResponse;
  update(args: UpdateOrderArgs): OrderResponse;
}
