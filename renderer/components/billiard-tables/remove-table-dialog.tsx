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
import { useTableStore } from "@/hooks/use-table-store";
import { toast } from "sonner";

export function RemoveTableDialog({
  children,
  tableId,
}: {
  children: React.ReactNode;
  tableId: number;
}) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { removeData } = useTableStore();

  const handleRemoveTable = async () => {
    setLoading(true);
    const result = await window.ipc.invoke("delete-table", {
      id: tableId,
    });
    setLoading(false);
    toast[result.success ? "success" : "error"](result.message);
    if (result.success) {
      removeData(tableId);
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
          <AlertDialogAction onClick={handleRemoveTable}>
            Xác nhận
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
