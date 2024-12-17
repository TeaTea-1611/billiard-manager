import Store from "electron-store";
import { type User } from "@prisma/client";

type StoreType = {
  me?: User | null;
  theme?: "light" | "dark" | "system";
};

export const store = new Store<StoreType>({
  encryptionKey: process.env.ELECTRON_STORE_ENCRYPTION_KEY || "fallback_key",
});
