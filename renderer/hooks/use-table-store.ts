import { MenuItem, Order, OrderItem, Table } from "@prisma/client";
import { create } from "zustand";

export interface Data extends Table {
  orders?: (Order & {
    orderItems: (OrderItem & {
      menuItem: MenuItem;
    })[];
  })[];
}

interface TableStore {
  data: Data[];
  setData: (data: Data[]) => void;
  addData: (data: Data) => void;
  updateData: (data: Data) => void;
  removeData: (id: number) => void;
  fetchData: () => void;
}

export const useTableStore = create<TableStore>((set, get) => ({
  data: [],
  setData: (data) => set({ data: data }),
  addData(data) {
    set({ data: [...get().data, data] });
  },
  updateData(data) {
    set({
      data: get().data.map((item) =>
        item.id === data.id ? { ...item, ...data } : item,
      ),
    });
  },
  removeData(id) {
    set({
      data: get().data.filter((item) => item.id !== id),
    });
  },
  fetchData: async () => {
    const result = await window.ipc.invoke("get-tables", null);

    if (result.data) {
      set({ data: result.data });
    }
  },
}));
