import { MenuItem } from "@prisma/client";
import { create } from "zustand";

const categoryMap = {
  0: "Đồ ăn",
  1: "Thức uống",
  2: "Khác",
};

interface MenuStore {
  data: MenuItem[];
  groupedData: Record<string, MenuItem[]>; // New field for grouped data
  setData: (menuItems: MenuItem[]) => void;
  addData: (data: MenuItem) => void;
  updateData: (data: MenuItem) => void;
  removeData: (id: number) => void;
  fetchData: () => Promise<void>;
}

export const useMenuStore = create<MenuStore>((set, get) => ({
  data: [],
  groupedData: {},

  setData: (menuItems) => {
    const grouped = groupByCategory(menuItems);
    set({ data: menuItems, groupedData: grouped });
  },

  addData: (data) => {
    const newData = [...get().data, data];
    set({
      data: newData,
      groupedData: groupByCategory(newData),
    });
  },

  updateData: (data) => {
    const updatedData = get().data.map((item) =>
      item.id === data.id ? { ...item, ...data } : item,
    );
    set({
      data: updatedData,
      groupedData: groupByCategory(updatedData),
    });
  },

  removeData: (id) => {
    const filteredData = get().data.filter((item) => item.id !== id);
    set({
      data: filteredData,
      groupedData: groupByCategory(filteredData),
    });
  },

  fetchData: async () => {
    const result = await window.ipc.invoke("get-menu-items", null);
    if (result?.data) {
      const grouped = groupByCategory(result.data);
      set({ data: result.data, groupedData: grouped });
    }
  },
}));

// Group menu items by category
const groupByCategory = (menuItems: MenuItem[]) => {
  return menuItems.reduce((acc, item) => {
    const category = categoryMap[item.category] || "Khác"; // Default to "Khác" if category is unknown
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);
};
