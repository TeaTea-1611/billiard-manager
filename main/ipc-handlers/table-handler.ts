import { ipcMain } from "electron";
import prisma from "../prisma";
import { store } from "../store";

class TableHandler {
  async createTable(args: {
    name: string;
    hourlyRate: number;
    description: string;
  }) {
    const user = store.get("me") || null;

    if (!user || user.role !== 0) {
      return {
        success: false,
        message: "Bạn không có quyền này.",
        data: null,
      };
    }

    const { name, hourlyRate, description } = args;

    if (await prisma.table.findUnique({ where: { name } })) {
      return {
        success: false,
        message: "Tên bàn đã tồn tại.",
        data: null,
      };
    }

    const newTable = await prisma.table.create({
      data: {
        name,
        hourlyRate,
        description,
      },
    });

    return {
      success: true,
      message: "Đã thêm bàn mới.",
      data: newTable,
    };
  }

  async getTables() {
    const tables = await prisma.table.findMany({
      include: {
        orders: {
          where: { endTime: null },
          include: {
            orderItems: {
              include: {
                menuItem: true,
              },
            },
          },
        },
      },
    });
    return {
      success: true,
      message: "Lấy danh sách bàn thành công.",
      data: tables,
    };
  }

  async updateTable(args: {
    id: number;
    name: string;
    hourlyRate: number;
    description: string;
  }) {
    const user = store.get("me") || null;

    if (!user || user.role !== 0) {
      return {
        success: false,
        message: "Bạn không có quyền này.",
        data: null,
      };
    }

    const { id, name, hourlyRate, description } = args;

    const updatedTable = await prisma.table.update({
      where: { id },
      data: {
        name,
        hourlyRate,
        description,
      },
    });

    return {
      success: true,
      message: "Đã cập nhật.",
      data: updatedTable,
    };
  }

  async deleteTable(args: { id: number }) {
    const user = store.get("me") || null;

    if (!user || user.role !== 0) {
      return {
        success: false,
        message: "Bạn không có quyền này.",
        data: null,
      };
    }

    const { id } = args;

    await prisma.table.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Đã xóa.",
    };
  }

  registerListeners() {
    ipcMain.handle("create-table", (_event, args) => this.createTable(args));
    ipcMain.handle("get-tables", () => this.getTables());
    ipcMain.handle("update-table", (_event, args) => this.updateTable(args));
    ipcMain.handle("delete-table", (_event, args) => this.deleteTable(args));
  }
}

const tableHandler = new TableHandler();
export default tableHandler;
