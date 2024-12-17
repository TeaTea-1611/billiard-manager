import { ipcMain, IpcMainEvent } from "electron";
import prisma from "../prisma";
import argon2 from "argon2";
import { store } from "../store";

class AuthHandler {
  async initializeDefaultUser() {
    try {
      const userCount = await prisma.user.count();

      if (userCount === 0) {
        const hashPassword = await argon2.hash("password");

        await prisma.user.create({
          data: {
            username: "admin",
            password: hashPassword,
            role: 0,
            fullname: "Admin Quản Trị",
          },
        });

        console.log("Đã khởi tạo tài khoản admin ban đầu thành công");
      }
    } catch (error) {
      console.error("Lỗi khi khởi tạo dữ liệu:", error);
    }
  }

  registerListeners() {
    ipcMain.handle("login", async (e, args) => {
      const { username, password } = args;

      const user = await prisma.user.findUnique({
        where: { username },
        select: {
          id: true,
          username: true,
          password: true,
          role: true,
          fullname: true,
        },
      });

      if (!user || !(await argon2.verify(user.password, password))) {
        return {
          success: false,
          message: "Tài khoản hoặc mật khẩu không đúng.",
        };
      }

      const { password: _, ...sanitizedUser } = user;

      store.set("me", sanitizedUser);

      return {
        success: true,
        message: "Đăng nhập thành công",
        user: sanitizedUser,
      };
    });

    ipcMain.handle("me", () => {
      return store.get("me") || null;
    });

    ipcMain.handle("logout", () => {
      store.delete("me");
      return {
        success: true,
        message: "Đã đăng xuất.",
      };
    });
  }
}

const authHandler = new AuthHandler();
export default authHandler;
