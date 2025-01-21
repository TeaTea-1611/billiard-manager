import { ipcMain } from "electron";
import prisma from "../../prisma";
import { BookingResponse, CreateBookingArgs } from "./booking.type";
import { BOOKING_IPC_CHANNELS } from "./booking.ipc-channels";

class BookingHandler {
  async create(args: CreateBookingArgs): BookingResponse {
    try {
      const { tableId } = args;

      const table = await prisma.table.findUnique({
        where: { id: tableId },
        include: {
          bookings: { where: { endTime: null } },
        },
      });

      if (!table || table.bookings.length) {
        throw new Error("Không hợp lệ.");
      }

      const order = await prisma.order.create({
        data: {},
      });

      const booking = await prisma.booking.create({
        data: {
          orderId: order.id,
          tableId: table.id,
          tableName: table.name,
          startTime: new Date(),
          hourlyRate: table.hourlyRate,
        },
      });

      return {
        success: true,
        message: "Thành công.",
        data: {
          ...table,
          bookings: [
            {
              ...booking,
              order: {
                ...order,
                orderItems: [],
              },
            },
          ],
        },
      };
    } catch (error) {
      console.log(error);

      return {
        success: false,
        message: "Đã xảy ra lỗi không xác định.",
      };
    }
  }

  registerListeners() {
    ipcMain.handle(BOOKING_IPC_CHANNELS.CREATE, (_event, args) =>
      this.create(args)
    );
  }
}

const bookingHandler = new BookingHandler();
export default bookingHandler;
