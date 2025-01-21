import prisma from "../../prisma";
import { ipcMain } from "electron";
import { ORDER_IPC_CHANNELS } from "./order.ipc-channels";
import {
  CreateOrderArgs,
  OrderResponse,
  OrdersArgs,
  OrdersResponse,
  UpdateOrderArgs,
} from "./order.type";
import { differenceInHours, differenceInMinutes } from "date-fns";
import { ApiResponsePromise } from "main/types/api-response";
import { Order } from "@prisma/client";

class OrderHandler {
  roundToThousand(number: number) {
    return Math.ceil(number / 1000) * 1000;
  }

  async create(args: CreateOrderArgs): OrderResponse {
    try {
      const { orderId, orderItems, customerName, phoneNumber } = args;

      const itemIds = orderItems.map((it) => it.itemId);

      const items = await prisma.item.findMany({
        where: { id: { in: itemIds } },
      });

      if (items.length !== orderItems.length) {
        throw new Error("Sản phẩm không tồn tại.");
      }

      let totalAmount = 0;

      const orderItemData = orderItems.map((orderItem) => {
        const item = items.find((it) => it.id === orderItem.itemId);
        if (!item) {
          throw new Error(`Không tìm thấy item với id ${orderItem.itemId}`);
        }

        const quantity = orderItem.quantity;
        const subtotalAmount = item.price * quantity;

        totalAmount += subtotalAmount;

        return {
          itemId: item.id,
          name: item.name,
          price: item.price,
          quantity,
          totalAmount: subtotalAmount,
        };
      });

      // update order
      if (orderId) {
        const existing = await prisma.order.findUnique({
          where: { id: orderId },
        });

        if (!existing) {
          return {
            success: false,
            message: "Hóa đơn không tồn tại.",
          };
        }

        const booking = await prisma.booking.findUnique({
          where: { orderId },
        });

        if (!booking) {
          return {
            success: false,
            message: "Booking không tồn tại.",
          };
        }

        const endTime = new Date();
        const hours = differenceInHours(endTime, booking.startTime);
        const minutes = differenceInMinutes(endTime, booking.startTime) % 60;
        const timeInHours = hours + minutes / 60;

        const tableCharge = this.roundToThousand(
          Math.ceil(timeInHours * booking.hourlyRate)
        );

        totalAmount += tableCharge;

        await prisma.booking.update({
          where: { orderId },
          data: {
            endTime,
            totalAmount: tableCharge,
          },
        });

        const updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: {
            customerName,
            phoneNumber,
            orderItems: {
              deleteMany: { orderId },
              createMany: { data: orderItemData },
            },
            totalAmount,
            payedAt: new Date(),
          },
          include: { booking: true, orderItems: true },
        });

        return {
          success: true,
          message: "Thành công.",
          data: updatedOrder,
        };
      }

      // create new order
      return {
        success: true,
        message: "Thành công.",
        data: await prisma.order.create({
          data: {
            customerName,
            phoneNumber,
            orderItems: { createMany: { data: orderItemData } },
            totalAmount,
            payedAt: new Date(),
          },
          include: { booking: true, orderItems: true },
        }),
      };
    } catch (error) {
      console.log(error);

      return {
        success: false,
        message: "Đã xảy ra lỗi không xác định.",
      };
    }
  }

  async update(args: UpdateOrderArgs): OrderResponse {
    try {
      const { orderId, orderItems, customerName, phoneNumber } = args;

      const itemIds = orderItems.map((it) => it.itemId);

      const items = await prisma.item.findMany({
        where: { id: { in: itemIds } },
      });

      if (items.length !== orderItems.length) {
        throw new Error("Sản phẩm không tồn tại.");
      }

      let totalAmount = 0;

      const orderItemData = orderItems.map((orderItem) => {
        const item = items.find((it) => it.id === orderItem.itemId);
        if (!item) {
          throw new Error(`Không tìm thấy item với id ${orderItem.itemId}`);
        }

        const quantity = orderItem.quantity;
        const subtotalAmount = item.price * quantity;

        totalAmount += subtotalAmount;

        return {
          itemId: item.id,
          name: item.name,
          price: item.price,
          quantity,
          totalAmount: subtotalAmount,
        };
      });

      return {
        success: true,
        message: "Thành công.",
        data: await prisma.order.update({
          where: { id: orderId },
          data: {
            customerName,
            phoneNumber,
            orderItems: {
              deleteMany: { orderId },
              createMany: { data: orderItemData },
            },
            totalAmount,
          },
          include: { booking: true, orderItems: true },
        }),
      };
    } catch (error) {
      console.log(error);

      return {
        success: false,
        message: "Đã xảy ra lỗi không xác định.",
      };
    }
  }

  async orders(args: OrdersArgs): OrdersResponse {
    const { take, page } = args;

    try {
      const data = await prisma.order.findMany({
        where: {
          NOT: { payedAt: null },
        },
        include: {
          booking: true,
          orderItems: true,
        },
        take,
        skip: page * take,
        orderBy: {
          payedAt: "desc",
        },
      });

      // Calculate the next and previous pages
      const totalOrders = await prisma.order.count({
        where: {
          NOT: { payedAt: null },
        },
      });
      const totalPages = Math.ceil(totalOrders / take);
      const nextPage = page + 1 < totalPages ? page + 1 : null;
      const previousPage = page > 0 ? page - 1 : null;

      return {
        success: true,
        message: "Thành công.",
        data,
        nextPage,
        previousPage,
      };
    } catch (error) {
      console.log(error);

      return {
        success: false,
        message: "Đã xảy ra lỗi không xác định.",
      };
    }
  }

  async getAllOrders(): ApiResponsePromise<Order[]> {
    try {
      return {
        success: true,
        message: "Thành công.",
        data: await prisma.order.findMany({
          where: { NOT: { payedAt: null } },
        }),
      };
    } catch (error) {
      return {
        success: false,
        message: "Đã xảy ra lỗi không xác định.",
      };
    }
  }

  registerListeners() {
    ipcMain.handle(ORDER_IPC_CHANNELS.CREATE, (_event, args) =>
      this.create(args)
    );
    ipcMain.handle(ORDER_IPC_CHANNELS.UPDATE, (_event, args) =>
      this.update(args)
    );
    ipcMain.handle(ORDER_IPC_CHANNELS.ORDERS, (_event, args) =>
      this.orders(args)
    );
    ipcMain.handle(ORDER_IPC_CHANNELS.GET_ALL, () => this.getAllOrders());
  }
}

const orderHandler = new OrderHandler();
export default orderHandler;
