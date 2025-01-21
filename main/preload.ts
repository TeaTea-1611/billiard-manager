import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import { BookingApi } from "./modules/booking/booking.type";
import { BOOKING_IPC_CHANNELS } from "./modules/booking/booking.ipc-channels";
import { ITEM_IPC_CHANNELS } from "./modules/item/item.ipc-channels";
import { ItemApi } from "./modules/item/item.type";
import { TABLE_IPC_CHANNELS } from "./modules/table/table.ipc-channels";
import { TableApi } from "./modules/table/table.type";
import { OrderApi } from "./modules/order/order.type";
import { ORDER_IPC_CHANNELS } from "./modules/order/order.ipc-channels";

const handler = {
  send(channel: string, value: unknown) {
    ipcRenderer.send(channel, value);
  },
  on(channel: string, callback: (...args: unknown[]) => void) {
    const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
      callback(...args);
    ipcRenderer.on(channel, subscription);

    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  },
  invoke(channel: string, value: unknown) {
    return ipcRenderer.invoke(channel, value);
  },
  api: {
    table: {
      table(args) {
        return ipcRenderer.invoke(TABLE_IPC_CHANNELS.TABLE, args);
      },
      tables() {
        return ipcRenderer.invoke(TABLE_IPC_CHANNELS.TABLES);
      },
      create(args) {
        return ipcRenderer.invoke(TABLE_IPC_CHANNELS.CREATE, args);
      },
      update(args) {
        return ipcRenderer.invoke(TABLE_IPC_CHANNELS.UPDATE, args);
      },
      delete(args) {
        return ipcRenderer.invoke(TABLE_IPC_CHANNELS.DELETE, args);
      },
    } as TableApi,
    item: {
      items() {
        return ipcRenderer.invoke(ITEM_IPC_CHANNELS.ITEMS);
      },
      create(args) {
        return ipcRenderer.invoke(ITEM_IPC_CHANNELS.CREATE, args);
      },
      update(args) {
        return ipcRenderer.invoke(ITEM_IPC_CHANNELS.UPDATE, args);
      },
      delete(args) {
        return ipcRenderer.invoke(ITEM_IPC_CHANNELS.DELETE, args);
      },
    } as ItemApi,
    booking: {
      create(args) {
        return ipcRenderer.invoke(BOOKING_IPC_CHANNELS.CREATE, args);
      },
    } as BookingApi,
    order: {
      orders(args) {
        return ipcRenderer.invoke(ORDER_IPC_CHANNELS.ORDERS, args);
      },
      create(args) {
        return ipcRenderer.invoke(ORDER_IPC_CHANNELS.CREATE, args);
      },
      update(args) {
        return ipcRenderer.invoke(ORDER_IPC_CHANNELS.UPDATE, args);
      },
      getAllOrders() {
        return ipcRenderer.invoke(ORDER_IPC_CHANNELS.GET_ALL);
      },
    } as OrderApi,
  },
};

contextBridge.exposeInMainWorld("ipc", handler);

export type IpcHandler = typeof handler;
