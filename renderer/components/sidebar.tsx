import { cn } from "@/lib/utils";
import {
  Grid2X2PlusIcon,
  LayersIcon,
  LayoutDashboardIcon,
  ReceiptTextIcon,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "./ui/button";

interface Props {
  className?: string;
}

export function Sidebar({ className }: Props) {
  const router = useRouter();

  return (
    <div className={cn("pb-12", className)}>
      <div className="px-1 py-4 space-y-1">
        <Button
          variant={router.pathname === "/home" ? "default" : "ghost"}
          className="justify-start w-full"
          asChild
        >
          <Link href={"/home"}>
            <LayoutDashboardIcon />
            Tổng Quan
          </Link>
        </Button>
        <Button
          variant={router.pathname === "/tables" ? "default" : "ghost"}
          className="justify-start w-full"
          asChild
        >
          <Link href={"/tables"}>
            <Grid2X2PlusIcon />
            Bàn Billiard
          </Link>
        </Button>
        <Button
          variant={router.pathname === "/items" ? "default" : "ghost"}
          className="justify-start w-full"
          asChild
        >
          <Link href={"/items"}>
            <LayersIcon />
            Sản Phẩm & Dịch Vụ
          </Link>
        </Button>
        <Button
          variant={router.pathname === "/orders/create" ? "default" : "ghost"}
          className="justify-start w-full"
          asChild
        >
          <Link href={"/orders/create"}>
            <ShoppingCart />
            Tạo Hóa Đơn
          </Link>
        </Button>
        <Button
          variant={router.pathname === "/orders" ? "default" : "ghost"}
          className="justify-start w-full"
          asChild
        >
          <Link href={"/orders"}>
            <ReceiptTextIcon />
            Hóa Đơn
          </Link>
        </Button>
      </div>
    </div>
  );
}
