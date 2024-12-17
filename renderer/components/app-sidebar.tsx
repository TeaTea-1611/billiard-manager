import * as React from "react";
import Link from "next/link";
import {
  ChevronRightIcon,
  LayoutDashboardIcon,
  MenuIcon,
  UtensilsIcon,
  TableIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useCurrentUser } from "@/hooks/use-current-user";
import { NavUser } from "@/components/nav-user";

interface SidebarMenuItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  subItems?: { href: string; label: string }[];
}

const MENU_ITEMS: SidebarMenuItem[] = [
  {
    href: "/home",
    label: "Tổng quan",
    icon: <LayoutDashboardIcon />,
  },
  {
    href: "/billiard-tables",
    label: "Bàn Billiard",
    icon: <TableIcon />,
    subItems: [
      {
        href: "/billiard-tables",
        label: "Quản lý các bàn",
      },
      {
        href: "/billiard-tables/order",
        label: "Đặt bàn",
      },
    ],
  },
  {
    href: "/menu-items",
    label: "Đồ Ăn & Thức Uống",
    icon: <UtensilsIcon />,
    subItems: [
      { href: "/menu-items", label: "Danh mục" },
      { href: "/menu-items/order", label: "Đặt đồ" },
    ],
  },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const user = useCurrentUser((state) => state.user);

  const renderMenuItems = () =>
    MENU_ITEMS.map((item) => (
      <SidebarMenu key={item.href}>
        {item.subItems ? (
          <Collapsible asChild defaultOpen>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href={item.href}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
              <CollapsibleTrigger asChild>
                <SidebarMenuAction className="data-[state=open]:rotate-90">
                  <ChevronRightIcon />
                  <span className="sr-only">Toggle</span>
                </SidebarMenuAction>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.subItems.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.href}>
                      <SidebarMenuSubButton asChild>
                        <Link href={subItem.href}>
                          <span>{subItem.label}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ) : (
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href={item.href}>
                {item.icon}
                {item.label}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    ));

  return (
    <Sidebar
      variant="sidebar"
      collapsible="none"
      {...props}
      className="min-h-[calc(100svh-36px)] max-h-[calc(100svh-36px)]"
    >
      <SidebarContent>
        <SidebarGroup>{renderMenuItems()}</SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
