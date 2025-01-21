import { ipcMain } from "electron";
import prisma from "../../prisma";
import {
  CreateItemArgs,
  DeleteItemArgs,
  ItemResponse,
  ItemsResponse,
  UpdateItemArgs,
} from "./item.type";
import { ITEM_IPC_CHANNELS } from "./item.ipc-channels";

class ItemHandler {
  async create(args: CreateItemArgs): ItemResponse {
    try {
      const { name, price, category } = args;

      if (await prisma.item.findUnique({ where: { name } })) {
        throw new Error("Sản phẩm đã tồn tại.");
      }

      const item = await prisma.item.create({
        data: {
          name,
          price,
          category,
        },
      });

      return {
        success: true,
        message: "Thành công",
        data: item,
      };
    } catch (error) {
      console.log(error);

      return {
        success: false,
        message: "Đã xảy ra lỗi không xác định.",
      };
    }
  }

  async items(): ItemsResponse {
    try {
      return {
        success: true,
        message: "Thành công",
        data: await prisma.item.findMany(),
      };
    } catch (error) {
      console.log(error);

      return {
        success: false,
        message: "Đã xảy ra lỗi không xác định.",
      };
    }
  }

  async update(args: UpdateItemArgs): ItemResponse {
    try {
      const { id, name, category, price } = args;

      const item = await prisma.item.findUnique({ where: { id } });

      if (!item) {
        throw new Error("Sản phẩm không tồn tại.");
      }

      if (item.name !== name) {
        const existing = await prisma.item.findUnique({
          where: { name },
        });

        if (existing) {
          throw new Error("Sản phẩm đã tồn tại.");
        }
      }

      return {
        success: true,
        message: "Thành công",
        data: await prisma.item.update({
          where: { id },
          data: {
            name,
            category,
            price,
          },
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

  async delete(args: DeleteItemArgs): ItemResponse {
    try {
      const { id } = args;

      await prisma.item.delete({
        where: { id },
      });

      return {
        success: true,
        message: "Thành công",
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
    ipcMain.handle(ITEM_IPC_CHANNELS.CREATE, (_event, args) =>
      this.create(args)
    );
    ipcMain.handle(ITEM_IPC_CHANNELS.ITEMS, () => this.items());
    ipcMain.handle(ITEM_IPC_CHANNELS.UPDATE, (_event, args) =>
      this.update(args)
    );
    ipcMain.handle(ITEM_IPC_CHANNELS.DELETE, (_event, args) =>
      this.delete(args)
    );
  }
}

const itemHandler = new ItemHandler();
export default itemHandler;
