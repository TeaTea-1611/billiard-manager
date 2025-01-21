import { app, BrowserWindow, ipcMain, Menu, Tray } from "electron";
import serve from "electron-serve";
import path from "path";
import { DEFAULT_WINDOW_CONFIG } from "./config";
import { createWindow } from "./helpers";
import tableHandler from "./modules/table/table.handler";
import itemHandler from "./modules/item/item.handler";
import bookingHandler from "./modules/booking/booking.handler";
import orderHandler from "./modules/order/order.handler";

let tray: Tray | null = null;
let mainWindow: BrowserWindow | null = null;

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (_event, _commandLine, _workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });

  const getIconPath = () => {
    const platform = process.platform;
    const iconName = platform === "win32" ? "icon.ico" : "icon.png";

    if (isProd) {
      return path.join(process.resourcesPath, iconName);
    } else {
      return path.join(__dirname, "../resources", iconName);
    }
  };

  const createTray = () => {
    // Kiểm tra xem hệ thống có hỗ trợ tray không
    if (process.platform === "linux" && !app.isUnityRunning()) {
      console.log("Tray không được hỗ trợ trên môi trường này");
      return;
    }

    try {
      const iconPath = getIconPath();
      tray = new Tray(iconPath);

      const contextMenu = Menu.buildFromTemplate([
        { label: "Mở ứng dụng", click: () => mainWindow?.show() },
        {
          label: "Thoát",
          click: () => {
            if (tray) {
              tray.destroy();
              tray = null;
            }
            app.quit();
          },
        },
      ]);

      tray.setToolTip("Billiard Manager");
      tray.setContextMenu(contextMenu);

      // Trên Linux, click vào tray không hoạt động giống Windows
      if (process.platform === "linux") {
        tray.on("right-click", () => {
          if (tray) {
            tray.popUpContextMenu();
          }
        });
      }

      tray.on("click", () => {
        mainWindow?.show();
      });
    } catch (error) {
      console.error("Lỗi khi tạo tray:", error);
    }
  };

  const isProd = process.env.NODE_ENV === "production";

  (async () => {
    if (isProd) {
      serve({ directory: "app" });
    } else {
      app.setPath("userData", `${app.getPath("userData")} (development)`);
    }

    await app.whenReady();

    mainWindow = createWindow("main", {
      ...DEFAULT_WINDOW_CONFIG,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
      },
    });

    if (isProd) {
      await mainWindow.loadURL("app://./home");
    } else {
      const port = process.argv[2];
      await mainWindow.loadURL(`http://localhost:${port}/home`);
      mainWindow.webContents.openDevTools();
    }

    tableHandler.registerListeners();
    itemHandler.registerListeners();
    bookingHandler.registerListeners();
    orderHandler.registerListeners();

    mainWindow.on("close", (event) => {
      event.preventDefault();
      mainWindow?.hide();
    });

    createTray();

    app.on("window-all-closed", () => {});

    app.on("before-quit", () => {
      if (tray) {
        tray.destroy();
        tray = null;
      }
    });
  })().then(() => {});

  ipcMain.on("window-minimize", () => {
    BrowserWindow.getFocusedWindow()?.minimize();
  });

  ipcMain.on("window-maximize", () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      win.isMaximized() ? win.unmaximize() : win.maximize();
    }
  });

  ipcMain.on("window-close", () => {
    BrowserWindow.getFocusedWindow()?.close();
  });
}
