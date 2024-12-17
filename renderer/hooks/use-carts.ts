import { MenuItem, OrderItem, Table } from "@prisma/client";
import { create } from "zustand";

interface CartsStore {
  items: {
    table?: Table & {
      startTime: Date;
    };
    orderItems: (MenuItem & {
      quantity: number;
    })[];
  }[];
  addPlaySession: (table: Table) => void;
  addOrderItem: ({
    tableId,
    orderItem,
  }: {
    tableId?: number;
    orderItem: MenuItem & {
      quantity: number;
    };
  }) => void;
  // removeItem: ({tableId, orderMenuItemId}) => void;
  // removeAll: () => void;
}

export const useCarts = create<CartsStore>((set, get) => ({
  items: [],
  addPlaySession(table) {
    set({
      items: [
        ...get().items,
        { table: { ...table, startTime: new Date() }, orderItems: [] },
      ],
    });
  },
  addOrderItem({ tableId, orderItem }) {
    set({});
  },
}));
