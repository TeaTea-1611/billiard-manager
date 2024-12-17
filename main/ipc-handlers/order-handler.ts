import { MenuItem, OrderItem } from "@prisma/client";
import { BrowserWindow, ipcMain } from "electron";
import prisma from "../prisma";
import { store } from "../store";

class OderHandler {
  registerListeners() {
    ipcMain.handle(
      "create-order",
      async (
        _event,
        args: {
          tableId?: number | null;
          menuItems: (MenuItem & { quantity: number })[];
        },
      ) => {
        const user = store.get("me") || null;

        if (!user) {
          return {
            success: false,
            message: "Bạn không có quyền này.",
            data: null,
          };
        }

        if (
          args.tableId &&
          (await prisma.order.findFirst({
            where: { tableId: args.tableId, endTime: null },
          }))
        ) {
          return {
            success: false,
            message: "Bàn này hiện đã chơi.",
          };
        }

        const order = await prisma.order.create({
          data: {
            tableId: args.tableId,
            startTime: args.tableId ? new Date() : null,
            orderItems: {
              create: args.menuItems.map((item) => ({
                menuItemId: item.id,
                quantity: item.quantity,
                subtotal: item.quantity * item.price,
              })),
            },
            amountTable: 0,
            totalAmount: 0,
            isPaid: false,
          },
          include: {
            table: true,
            orderItems: {
              include: { menuItem: true },
            },
          },
        });

        return {
          success: true,
          message: "Đặt bàn thành công.",
          data: order,
        };
      },
    );

    ipcMain.handle(
      "update-order",
      async (
        _event,
        args: {
          orderId: number;
          menuItems: (MenuItem & { quantity: number })[];
        },
      ) => {
        const user = store.get("me") || null;

        if (!user) {
          return {
            success: false,
            message: "Bạn không có quyền này.",
            data: null,
          };
        }

        const order = await prisma.order.update({
          where: {
            id: args.orderId,
          },
          data: {
            orderItems: {
              deleteMany: {},
              create: args.menuItems.map((item) => ({
                menuItemId: item.id,
                quantity: item.quantity,
                subtotal: item.quantity * item.price,
              })),
            },
          },
          include: {
            table: true,
            orderItems: {
              include: { menuItem: true },
            },
          },
        });

        return {
          success: true,
          message: "Đã cập nhật.",
          data: order,
        };
      },
    );

    ipcMain.handle(
      "checkout-order",
      async (
        _event,
        args: {
          orderId: number;
        },
      ) => {
        const user = store.get("me") || null;

        if (!user) {
          return {
            success: false,
            message: "Bạn không có quyền này.",
            data: null,
          };
        }

        const order = await prisma.order.findUnique({
          where: { id: args.orderId },
          include: {
            table: true,
            orderItems: {
              include: {
                menuItem: true,
              },
            },
          },
        });

        const startTime = new Date(order.startTime);
        const endTime = new Date();
        const hoursWorked =
          Math.abs(endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

        const amountTable =
          Math.ceil((hoursWorked * order.table.hourlyRate) / 1000) * 1000;

        const totalAmount =
          order.orderItems.reduce((pre, cur) => {
            return pre + cur.menuItem.price * cur.quantity;
          }, 0) + amountTable;

        if (order) {
          const updatedOrder = await prisma.order.update({
            where: { id: order.id },
            data: {
              endTime,
              isPaid: true,
              amountTable,
              totalAmount,
            },
          });

          return {
            success: true,
            message: "Thành công.",
            data: updatedOrder,
          };
        }

        return {
          success: false,
          message: "Thất bại.",
        };
      },
    );

    ipcMain.handle("get-orders", async (_, { page, pageSize }) => {
      const skip = (page - 1) * pageSize;
      const take = pageSize;

      const orders = await prisma.order.findMany({
        skip,
        take,
        include: {
          orderItems: { include: { menuItem: true } },
          table: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const totalOrders = await prisma.order.count();

      return {
        data: orders,
        total: totalOrders,
        page,
        pageSize,
      };
    });

    ipcMain.handle("print-invoice", async (_, { html, printOptions }) => {
      try {
        const win = new BrowserWindow({
          show: false,
          webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
          },
        });

        win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

        win.webContents.on("did-finish-load", () => {
          win.webContents.print(printOptions, (success, failureReason) => {
            if (!success) {
              console.error("Print failed:", failureReason);
            }
          });
        });

        return { success: true };
      } catch (error) {
        console.error("Printing error:", error);
        return {
          success: false,
          message: "Lỗi in hóa đơn",
        };
      }
    });
  }
}

const oderHandler = new OderHandler();
export default oderHandler;
