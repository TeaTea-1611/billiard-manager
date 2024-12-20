import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  LayoutDashboardIcon,
  LayoutGridIcon,
  ReceiptIcon,
  UtensilsCrossedIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

interface Props {
  className?: string;
}

export function Sidebar({ className }: Props) {
  const router = useRouter();

  return (
    <div className={cn("pb-12", className)}>
      <div className="py-4 space-y-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Button
              variant={router.pathname === "/home" ? "default" : "ghost"}
              className="justify-start w-full"
              asChild
            >
              <Link href={"/home"}>
                <LayoutDashboardIcon />
                Tổng quan
              </Link>
            </Button>
            <Button
              variant={
                router.pathname === "/billiard-tables" ? "default" : "ghost"
              }
              className="justify-start w-full"
              asChild
            >
              <Link href={"/billiard-tables"}>
                <LayoutGridIcon />
                Bàn billiard
              </Link>
            </Button>
            <Button
              variant={router.pathname === "/menu-items" ? "default" : "ghost"}
              className="justify-start w-full"
              asChild
            >
              <Link href={"/menu-items"}>
                <UtensilsCrossedIcon />
                Đồ ăn & Thức uống
              </Link>
            </Button>
            <Button
              variant={
                router.pathname.includes("/orders") ? "default" : "ghost"
              }
              className="justify-start w-full"
              asChild
            >
              <Link href={"/orders"}>
                <ReceiptIcon />
                Hóa đơn
              </Link>
            </Button>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="px-4 mb-2 text-lg font-semibold tracking-tight">
            Library
          </h2>
          <div className="space-y-1">
            <Button variant="ghost" className="justify-start w-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 mr-2"
              >
                <path d="M21 15V6" />
                <path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                <path d="M12 12H3" />
                <path d="M16 6H3" />
                <path d="M12 18H3" />
              </svg>
              Playlists
            </Button>
            <Button variant="ghost" className="justify-start w-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 mr-2"
              >
                <circle cx="8" cy="18" r="4" />
                <path d="M12 18V2l7 4" />
              </svg>
              Songs
            </Button>
            <Button variant="ghost" className="justify-start w-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 mr-2"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Made for You
            </Button>
            <Button variant="ghost" className="justify-start w-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 mr-2"
              >
                <path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12" />
                <circle cx="17" cy="7" r="5" />
              </svg>
              Artists
            </Button>
            <Button variant="ghost" className="justify-start w-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 mr-2"
              >
                <path d="m16 6 4 14" />
                <path d="M12 6v14" />
                <path d="M8 8v12" />
                <path d="M4 4v16" />
              </svg>
              Albums
            </Button>
          </div>
        </div>
        <div className="py-2">
          <h2 className="relative text-lg font-semibold tracking-tight px-7">
            Playlists
          </h2>
          {/* <ScrollArea className="h-[300px] px-1">
            <div className="p-2 space-y-1">
              {playlists?.map((playlist, i) => (
                <Button
                  key={`${playlist}-${i}`}
                  variant="ghost"
                  className="justify-start w-full font-normal"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 mr-2"
                  >
                    <path d="M21 15V6" />
                    <path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                    <path d="M12 12H3" />
                    <path d="M16 6H3" />
                    <path d="M12 18H3" />
                  </svg>
                  {playlist}
                </Button>
              ))}
            </div>
          </ScrollArea> */}
        </div>
      </div>
    </div>
  );
}
