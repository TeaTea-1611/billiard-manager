import { LoaderIcon } from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import { useCurrentUser } from "@/hooks/use-current-user";
import { User } from "@prisma/client";
import { Button } from "./ui/button";
import Link from "next/link";
import Head from "next/head";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { toast } from "sonner";
import { ModeToggle } from "./mode-toggle";
import { Sidebar } from "./sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const user = useCurrentUser((state) => state.user);
  const setUser = useCurrentUser((state) => state.setUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      (async () => {
        const result = await window.ipc.invoke("me", null);
        if (result) {
          setUser(result);
        }
        setLoading(false);
      })();
    }
  }, [loading, setUser]);

  useEffect(() => {
    window.ipc.on("toast", (data: { success: boolean; message: string }) => {
      toast[data.success ? "success" : "error"](data.message);
    });
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user && router.pathname !== "/login") {
        router.push("/login");
      }
    }
  }, [user, router, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen size-full">
        <LoaderIcon className="size-6 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen size-full">
        <Button asChild>
          <Link href={"/login"}>Đăng nhập</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Billiard</title>
      </Head>
      <div className="border-t">
        <div className="relative bg-background">
          <Sidebar className="fixed bottom-0 left-0 w-64 border-r top-9" />
          <div className="pl-64">
            <div className="h-full px-4 py-6">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}
