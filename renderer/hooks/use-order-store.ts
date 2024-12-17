// import { MenuItem, Order, OrderItem, Table } from "@prisma/client";
// import { create } from "zustand";

// interface Data extends Order {
//   table?: Table;
//   orderItems: (OrderItem & {
//     menuItem: MenuItem;
//   })[];
// }

// interface OrderStore {
//   data: Data[];
//   setData: (data: Data[]) => void;
//   fetchData: () => void;
// }

// export const useOrderStore = create<OrderStore>((set) => ({
//   data: [],
//   setData: (data) => set({ data: data }),

//   fetchData: async () => {
//     const result = await window.ipc.invoke("get-orders", null);

//     if (result) {
//       set({ data: result });
//     }
//   },
// }));
