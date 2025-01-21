import { Table, Booking, Order, OrderItem } from "@prisma/client";
import { ApiResponsePromise } from "../../types/api-response";

export type TableWithBooking = Table & {
  bookings: (Booking & {
    order: Order & { orderItems: OrderItem[] };
  })[];
};

export interface CreateTableArgs {
  name: string;
  hourlyRate: number;
}

export interface UpdateTableArgs {
  id: number;
  name: string;
  hourlyRate: number;
}

export interface DeleteTableArgs {
  id: number;
}

export interface TableArgs {
  id: number;
}

export type TableResponse = ApiResponsePromise<TableWithBooking>;
export type TablesResponse = ApiResponsePromise<TableWithBooking[]>;

export interface TableApi {
  table(args: TableArgs): TableResponse;
  tables(): TablesResponse;
  create(args: CreateTableArgs): TableResponse;
  update(args: UpdateTableArgs): TableResponse;
  delete(args: DeleteTableArgs): TableResponse;
}
