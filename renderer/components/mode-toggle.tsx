"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LaptopMinimal, Moon, Sun } from "lucide-react";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="bg-transparent size-7">
          <Sun className="absolute transition-all scale-100 rotate-0 size-4 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute transition-all scale-0 rotate-90 size-4 dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="data-[state=open]:motion-scale-in-[0.24] data-[state=open]:motion-translate-x-in-[18%] data-[state=open]:motion-translate-y-in-[-56%] data-[state=open]:motion-opacity-in-[0%] data-[state=open]:motion-rotate-in-[-10deg] data-[state=open]:motion-blur-in-[5px] data-[state=open]:motion-duration-[0.35s] data-[state=open]:motion-duration-[0.53s]/scale data-[state=open]:motion-duration-[0.53s]/translate motion-duration-[0.63s]/rotate data-[state=closed]:motion-scale-out-[0.24] data-[state=closed]:motion-translate-x-out-[18%] data-[state=closed]:motion-translate-y-out-[-56%] data-[state=closed]:motion-opacity-out-[0%] data-[state=closed]:motion-rotate-out-[10deg] data-[state=closed]:motion-blur-out-[5px] data-[state=closed]:motion-duration-[0.35s] data-[state=closed]:motion-duration-[0.53s]/scale data-[state=closed]:motion-duration-[0.53s]/translate data-[state=closed]:motion-duration-[0.63s]/rotate"
      >
        <DropdownMenuItem
          onClick={() => {
            setTheme("light");
            window.ipc.send("set-theme", "light");
          }}
        >
          <Sun className="mr-2 size-4" />
          <span>Chế độ sáng</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setTheme("dark");
            window.ipc.send("set-theme", "dark");
          }}
        >
          <Moon className="mr-2 size-4" />
          <span>Chế độ tối</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setTheme("system");
            window.ipc.send("set-theme", "system");
          }}
        >
          <LaptopMinimal className="mr-2 size-4" />
          <span>Mặc định hệ thống</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
