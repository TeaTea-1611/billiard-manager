import {
  MinusIcon,
  MoonIcon,
  RotateCwIcon,
  SquareIcon,
  SunIcon,
  XIcon,
} from "lucide-react";
import Head from "next/head";
import React from "react";
import { Sidebar } from "./sidebar";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { inter } from "@/styles/fonts";
import { Separator } from "./ui/separator";
import { useRouter } from "next/router";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { setTheme, resolvedTheme } = useTheme();
  const router = useRouter();
  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  const handleMinimize = () => {
    window.ipc.send("window-minimize", null);
  };

  const handleMaximize = () => {
    window.ipc.send("window-maximize", null);
  };

  const handleClose = () => {
    window.ipc.send("window-close", null);
  };

  return (
    <>
      <Head>
        <title>Billiard Manager</title>
      </Head>
      <div
        className={`flex items-center px-2 border-b h-9 bg-card ${inter.className}`}
      >
        <div id="titlebar" className="flex items-center flex-1">
          <span className="text-sm font-semibold">Billiard Manage</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            className="px-0 size-6"
            onClick={() => {
              router.reload();
            }}
          >
            <RotateCwIcon />
          </Button>
          <Button
            variant="outline"
            className="px-0 size-6 group/toggle"
            onClick={toggleTheme}
          >
            <SunIcon className="hidden [html.dark_&]:block" />
            <MoonIcon className="hidden [html.light_&]:block" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
        <Separator orientation="vertical" className="mx-2" />
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={handleMinimize}
            className="inline-flex items-center justify-center bg-yellow-400 rounded-full group size-4 text-primary-foreground hover:opacity-90"
          >
            <MinusIcon className="duration-200 opacity-0 size-3 group-hover:opacity-100" />
          </button>
          <button
            onClick={handleMaximize}
            className="inline-flex items-center justify-center bg-green-400 rounded-full group size-4 text-primary-foreground hover:opacity-90"
          >
            <SquareIcon className="duration-200 opacity-0 size-3 group-hover:opacity-100" />
          </button>
          <button
            onClick={handleClose}
            className="inline-flex items-center justify-center bg-red-400 rounded-full group size-4 text-primary-foreground hover:opacity-90"
          >
            <XIcon className="duration-200 opacity-0 size-3 group-hover:opacity-100" />
          </button>
        </div>
      </div>
      <div className={`h-[calc(100vh-36px)] overflow-auto ${inter.className}`}>
        <div className="relative bg-background">
          <Sidebar className="fixed bottom-0 left-0 w-64 border-r top-9" />
          <div className="pl-64">
            <div className="flex flex-col h-full gap-3 px-3 py-2">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
