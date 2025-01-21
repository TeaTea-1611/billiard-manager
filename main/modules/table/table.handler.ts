import { ipcMain } from "electron";
import {
  CreateTableArgs,
  DeleteTableArgs,
  TableArgs,
  TableResponse,
  TablesResponse,
  UpdateTableArgs,
} from "./table.type";
import prisma from "../../prisma";
import { TABLE_IPC_CHANNELS } from "./table.ipc-channels";

class TableHandler {
  async create(args: CreateTableArgs): TableResponse {
    try {
      const { name, hourlyRate } = args;

      if (await prisma.table.findUnique({ where: { name } })) {
        throw new Error("Bàn đã tồn tại.");
      }

      const table = await prisma.table.create({
        data: {
          name,
          hourlyRate,
        },
        include: {
          bookings: {
            where: { endTime: null },
            include: { order: { include: { orderItems: true } } },
          },
        },
      });

      return {
        success: true,
        message: "Thành công.",
        data: table,
      };
    } catch (error) {
      console.log(error);

      return {
        success: false,
        message: "Đã xảy ra lỗi không xác định.",
      };
    }
  }

  async tables(): TablesResponse {
    try {
      const data = await prisma.table.findMany({
        include: {
          bookings: {
            where: { endTime: null },
            include: {
              order: { include: { orderItems: true } },
            },
          },
        },
      });

      return {
        success: true,
        message: "Thành công.",
        data,
      };
    } catch (error) {
      console.log(error);

      return {
        success: false,
        message: "Đã xảy ra lỗi không xác định.",
      };
    }
  }

  async table({ id }: TableArgs): TableResponse {
    try {
      const data = await prisma.table.findUnique({
        where: { id },
        include: {
          bookings: {
            where: { endTime: null },
            include: {
              order: { include: { orderItems: true } },
            },
          },
        },
      });

      return {
        success: true,
        message: "Thành công.",
        data,
      };
    } catch (error) {
      console.log(error);

      return {
        success: false,
        message: "Đã xảy ra lỗi không xác định.",
      };
    }
  }

  async update(args: UpdateTableArgs): TableResponse {
    try {
      const { id, name, hourlyRate } = args;

      const table = await prisma.table.findUnique({ where: { id } });

      if (!table) {
        throw new Error("Bàn không tồn tại.");
      }

      if (table.name !== name) {
        const existing = await prisma.table.findUnique({
          where: { name },
        });

        if (existing) {
          throw new Error("Bàn đã tồn tại.");
        }
      }

      const updated = await prisma.table.update({
        where: { id },
        data: {
          name,
          hourlyRate,
        },
        include: {
          bookings: {
            where: { endTime: null },
            include: {
              order: { include: { orderItems: true } },
            },
          },
        },
      });

      return {
        success: true,
        message: "Thành công.",
        data: updated,
      };
    } catch (error) {
      console.log(error);

      return {
        success: false,
        message: "Đã xảy ra lỗi không xác định.",
      };
    }
  }

  async delete(args: DeleteTableArgs): TableResponse {
    try {
      const { id } = args;

      await prisma.table.delete({
        where: { id },
      });

      return {
        success: true,
        message: "Thành công.",
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
    ipcMain.handle(TABLE_IPC_CHANNELS.TABLES, () => this.tables());
    ipcMain.handle(TABLE_IPC_CHANNELS.TABLE, (_event, args) =>
      this.table(args)
    );
    ipcMain.handle(TABLE_IPC_CHANNELS.CREATE, (_event, args) =>
      this.create(args)
    );
    ipcMain.handle(TABLE_IPC_CHANNELS.UPDATE, (_event, args) =>
      this.update(args)
    );
    ipcMain.handle(TABLE_IPC_CHANNELS.DELETE, (_event, args) =>
      this.delete(args)
    );
  }
}

const tableHandler = new TableHandler();
export default tableHandler;
