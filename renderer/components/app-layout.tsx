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

export function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const user = useCurrentUser((state) => state.user);
  const setUser = useCurrentUser((state) => state.setUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      window.ipc.send("me", null);

      const handleUserResponse = (fetchedUser: User | null) => {
        setUser(fetchedUser);
        setLoading(false);
      };

      window.ipc.on("me", handleUserResponse);
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
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex items-center h-16 gap-2 shrink-0">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              {/* <Separator orientation="vertical" className="h-4 mr-2" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">
                      Building Your Application
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb> */}
            </div>
          </header>
          <div className="p-4">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
