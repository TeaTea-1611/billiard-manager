import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { useMenuStore } from "@/hooks/use-menu-store";
import { toast } from "sonner";

export function RemoveMenuItemDialog({
  children,
  menuItemId,
}: {
  children: React.ReactNode;
  menuItemId: number;
}) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { removeData } = useMenuStore();

  const handleRemoveMenuItem = async () => {
    setLoading(true);
    const result = await window.ipc.invoke("delete-menu-item", {
      id: menuItemId,
    });
    setLoading(false);
    toast[result.success ? "success" : "error"](result.message);
    if (result.success) {
      removeData(menuItemId);
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn có chắc?</AlertDialogTitle>
          <AlertDialogDescription>
            Dữ liệu sẽ không thể khôi phục.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={handleRemoveMenuItem} disabled={loading}>
            Xác nhận
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
