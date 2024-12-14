import { create } from "zustand";
import { type User } from "@prisma/client";

type UserState = {
  user: User | null;
  setUser: (user: User | null) => void;
};

export const useCurrentUser = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
