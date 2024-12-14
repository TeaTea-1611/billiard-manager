import path from "path";
import { app, ipcMain } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import prisma from "./prisma";
import argon2 from "argon2";
import Store from "electron-store";
import { User } from "@prisma/client";

const isProd = process.env.NODE_ENV === "production";

async function initializeData() {
  try {
    const userCount = await prisma.user.count();

    if (userCount === 0) {
      const hashPassword = await argon2.hash("password");

      await prisma.user.create({
        data: {
          username: "admin",
          password: hashPassword,
          role: 0,
          fullname: "admin",
        },
      });

      console.log("Đã khởi tạo dữ liệu ban đầu thành công");
    }
  } catch (error) {
    console.error("Lỗi khi khởi tạo dữ liệu:", error);
  }
}

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

(async () => {
  await app.whenReady();
  await initializeData();

  const mainWindow = createWindow("main", {
    width: 1280,
    height: 772,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    autoHideMenuBar: true,
  });

  if (isProd) {
    await mainWindow.loadURL("app://./home");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }
})();

app.on("window-all-closed", () => {
  app.quit();
});

app.on("before-quit", () => {
  // store.delete("me");
});

type StoreType = {
  me?: User | null;
};

const store = new Store<StoreType>({
  encryptionKey: "my_secure_encryption_key",
});

ipcMain.on("login", async (event, args) => {
  const { username, password } = args;

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || !(await argon2.verify(user.password, password))) {
      event.reply("login", {
        success: false,
        message: "Tài khoản hay mật khẩu không đúng.",
      });
      return;
    }

    const sanitizedUser = {
      ...user,
      password: "",
    };

    store.set("me", sanitizedUser);

    event.reply("login", {
      success: true,
      message: "Đăng nhập thành công",
      user: sanitizedUser,
    });
  } catch (error) {
    event.reply("toast", {
      success: false,
      message: "Đã xảy ra lỗi. Vui lòng thử lại sau.",
    });
  }
});

ipcMain.on("me", (event) => {
  event.reply("me", store.get("me") || null);
});

ipcMain.on("logout", async (event) => {
  store.delete("me");
  event.reply("toast", { success: true, message: "Đã đăng xuất." });
});

ipcMain.on("create-table", async (event, args) => {
  const user = store.get("me") || null;

  if (!user || user.role !== 0) {
    event.reply("toast", {
      success: false,
      message: "Bạn không có quyền này.",
    });
    return;
  }

  const { name, hourlyRate, description } = args;

  if (await prisma.table.findUnique({ where: { name } })) {
    event.reply("toast", {
      success: false,
      message: "Tên bàn đã tồn tại.",
    });
    return;
  }

  await prisma.table.create({
    data: {
      name,
      hourlyRate,
      description,
    },
  });
  const tables = await prisma.table.findMany();

  event.reply("tables", tables);
  event.reply("toast", {
    success: true,
    message: "Đã thêm bàn mới.",
  });
});

ipcMain.on("get-tables", async (event) => {
  const tables = await prisma.table.findMany();

  event.reply("tables", tables);
});

ipcMain.on("update-table", async (event, args) => {
  const user = store.get("me") || null;

  if (!user || user.role !== 0) {
    event.reply("toast", {
      success: false,
      message: "Bạn không có quyền này.",
    });
    return;
  }

  const { id, name, hourlyRate, description } = args;

  await prisma.table.update({
    where: { id },
    data: {
      name,
      hourlyRate,
      description,
    },
  });

  const tables = await prisma.table.findMany();

  event.reply("tables", tables);
  event.reply("toast", {
    success: true,
    message: "Đã cập nhật.",
  });
});

ipcMain.on("delete-table", async (event, args) => {
  const user = store.get("me") || null;

  if (!user || user.role !== 0) {
    event.reply("toast", {
      success: false,
      message: "Bạn không có quyền này.",
    });
    return;
  }

  const { id } = args;

  await prisma.table.delete({
    where: { id },
  });

  const tables = await prisma.table.findMany();

  event.reply("tables", tables);
  event.reply("toast", {
    success: true,
    message: "Đã xóa.",
  });
});

ipcMain.on("get-tables-with-status", async (event) => {
  const tablesWithStatus = await prisma.table.findMany({
    include: { playSessions: { where: { endTime: null } } },
  });

  const tablesStatus = tablesWithStatus.map((table) => {
    const isAvailable =
      table.playSessions.length === 0 ||
      table.playSessions.every((session) => session.endTime !== null);
    return {
      ...table,
      isAvailable,
    };
  });

  event.reply("tables-with-status", tablesStatus);
});

ipcMain.on("create-play-session", async (event, args) => {
  const user = store.get("me") || null;

  if (!user) {
    event.reply("toast", {
      success: false,
      message: "Bạn không có quyền này.",
    });
    return;
  }

  const { tableId } = args;

  await prisma.playSession.create({
    data: { tableId },
  });

  const tablesWithStatus = await prisma.table.findMany({
    include: { playSessions: { where: { endTime: null } } },
  });

  const tablesStatus = tablesWithStatus.map((table) => {
    const isAvailable =
      table.playSessions.length === 0 ||
      table.playSessions.every((session) => session.endTime !== null);
    return {
      ...table,
      isAvailable,
    };
  });

  event.reply("tables-with-status", tablesStatus);
});
