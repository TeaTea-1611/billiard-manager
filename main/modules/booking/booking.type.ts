import { ApiResponsePromise } from "../../types/api-response";
import { TableWithBooking } from "../table/table.type";

export interface CreateBookingArgs {
  tableId: number;
}

export type BookingResponse = ApiResponsePromise<TableWithBooking>;

export interface BookingApi {
  create(args: CreateBookingArgs): BookingResponse;
}
