import { BrowserWindowConstructorOptions } from "electron";

export const DEFAULT_WINDOW_CONFIG: BrowserWindowConstructorOptions = {
  width: 1280,
  height: 772,
  minWidth: 1280,
  minHeight: 772,
  fullscreen: false,
  autoHideMenuBar: true,
  titleBarStyle: "hidden",
  frame: false,
};
