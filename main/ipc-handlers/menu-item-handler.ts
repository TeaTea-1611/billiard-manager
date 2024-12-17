import { ipcMain, IpcMainEvent } from "electron";
import prisma from "../prisma";
import { store } from "../store";

class MenuItemHandler {
  registerListeners() {
    ipcMain.handle("create-menu-item", async (event, args) => {
      const user = store.get("me") || null;

      if (!user || user.role !== 0) {
        return {
          success: false,
          message: "Bạn không có quyền này.",
        };
      }

      const { name, price, category } = args;

      if (await prisma.menuItem.findUnique({ where: { name } })) {
        return {
          success: false,
          message: "Tên sản phẩm đã tồn tại.",
        };
      }

      const item = await prisma.menuItem.create({
        data: {
          name,
          price,
          category,
        },
      });

      return {
        success: true,
        message: "Đã thêm sản phẩm mới.",
        data: item,
      };
    });
    ipcMain.handle("get-menu-items", async () => {
      return {
        success: true,
        message: "Lấy danh sách sản phẩm thành công.",
        data: await prisma.menuItem.findMany(),
      };
    });
    ipcMain.handle("update-menu-item", async (event, args) => {
      const user = store.get("me") || null;

      if (!user || user.role !== 0) {
        return {
          success: false,
          message: "Bạn không có quyền này.",
        };
      }

      const { id, name, price, category } = args;

      const item = await prisma.menuItem.update({
        where: { id },
        data: {
          name,
          category,
          price,
        },
      });
      return {
        success: true,
        message: "Đã cập nhật.",
        data: item,
      };
    });
    ipcMain.handle("delete-menu-item", async (event, args) => {
      const user = store.get("me") || null;

      if (!user || user.role !== 0) {
        return {
          success: false,
          message: "Bạn không có quyền này.",
        };
      }

      const { id } = args;

      await prisma.menuItem.delete({
        where: { id },
      });

      return {
        success: true,
        message: "Đã xóa.",
      };
    });
  }
}

const menuItemHandler = new MenuItemHandler();
export default menuItemHandler;
