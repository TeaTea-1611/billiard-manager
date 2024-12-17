import { app, BrowserWindow, ipcMain, Menu, nativeTheme, Tray } from "electron";
import serve from "electron-serve";
import path from "path";
import { DEFAULT_WINDOW_CONFIG } from "./constants";
import { createWindow } from "./helpers";
import authHandler from "./ipc-handlers/auth-handler";
import tableHandler from "./ipc-handlers/table-handler";
import { store } from "./store";
import menuItemHandler from "./ipc-handlers/menu-item-handler";
import oderHandler from "./ipc-handlers/order-handler";

let tray: Tray | null = null;

const createTray = () => {
  tray = new Tray(path.join(__dirname, "../resources/icon.ico"));
  const contextMenu = Menu.buildFromTemplate([
    { label: "Mở ứng dụng", click: () => mainWindow?.show() },
    { label: "Thoát", click: () => app.quit() },
  ]);

  tray.setToolTip("Billiard Manager");
  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    mainWindow?.show();
  });
};

const getSystemTheme = (): "light" | "dark" => {
  return nativeTheme.shouldUseDarkColors ? "dark" : "light";
};

const getCurrentTheme = (): "light" | "dark" | "system" => {
  const theme = store.get("theme") || "system";
  return theme === "system" ? getSystemTheme() : theme;
};

const isProd = process.env.NODE_ENV === "production";

let mainWindow: BrowserWindow | null = null;

(async () => {
  if (isProd) {
    serve({ directory: "app" });
  } else {
    app.setPath("userData", `${app.getPath("userData")} (development)`);
  }

  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    app.quit();
    return;
  }

  app.on("second-instance", (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  await app.whenReady();

  mainWindow = createWindow("main", {
    width: DEFAULT_WINDOW_CONFIG.width,
    height: DEFAULT_WINDOW_CONFIG.height,
    autoHideMenuBar: DEFAULT_WINDOW_CONFIG.autoHideMenuBar,
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: getCurrentTheme() === "dark" ? "#12182b" : "#ffffff",
      symbolColor: getCurrentTheme() === "dark" ? "#f8fafc" : "#000000",
      height: 24,
    },
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.webContents.once("did-finish-load", () => {
    const currentTheme = store.get("theme") || "system";
    const themeToSend =
      currentTheme === "system" ? getSystemTheme() : currentTheme;
    mainWindow.webContents.send("theme-updated", themeToSend);
  });

  if (isProd) {
    await mainWindow.loadURL("app://./login");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/login`);
    mainWindow.webContents.openDevTools();
  }

  await authHandler.initializeDefaultUser();

  authHandler.registerListeners();
  tableHandler.registerListeners();
  menuItemHandler.registerListeners();
  oderHandler.registerListeners();

  mainWindow.on("close", (event) => {
    event.preventDefault();
    mainWindow?.hide();
  });

  createTray();

  app.on("window-all-closed", () => {});

  app.on("before-quit", () => {
    // store.delete("me");
    tray?.destroy();
  });

  nativeTheme.on("updated", () => {
    const currentTheme = store.get("theme") || "system";

    if (currentTheme === "system" && mainWindow) {
      const systemTheme = getSystemTheme();
      mainWindow.webContents.send("theme-updated", systemTheme);
    }
  });

  ipcMain.on("set-theme", (_event, theme: "light" | "dark" | "system") => {
    store.set("theme", theme);
    const themeToApply = theme === "system" ? getSystemTheme() : theme;

    if (mainWindow) {
      mainWindow.setTitleBarOverlay({
        color: themeToApply === "dark" ? "#12182b" : "#ffffff",
        symbolColor: themeToApply === "dark" ? "#f8fafc" : "#000000",
      });
    }

    mainWindow?.webContents.send("theme-updated", themeToApply);
  });
})().then(() => {});
