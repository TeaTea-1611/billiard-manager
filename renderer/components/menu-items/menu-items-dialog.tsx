import { useMenuStore } from "@/hooks/use-menu-store";
import { MenuItem } from "@prisma/client";
import React from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";

const MenuItemsDialog = ({
  children,
  selectMenuItem,
}: {
  children: React.ReactNode;
  selectMenuItem: (item: MenuItem) => void;
}) => {
  const { groupedData } = useMenuStore();

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sản phẩm</DialogTitle>
        </DialogHeader>
        <ScrollArea className="w-full pr-4 h-96">
          <div className="space-y-4">
            {Object.entries(groupedData).map(([category, items]) => (
              <div key={category} className="space-y-1">
                <h4 className="text-sm font-semibold text-muted-foreground">
                  {category}
                </h4>
                <div className="grid gap-2">
                  {items.map((menuItem) => (
                    <Button
                      key={menuItem.id}
                      variant="outline"
                      onClick={() => {
                        selectMenuItem(menuItem);
                      }}
                      className="justify-start"
                    >
                      {menuItem.name}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MenuItemsDialog;
