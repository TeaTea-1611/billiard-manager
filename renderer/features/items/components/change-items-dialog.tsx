import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useItems } from "../api/use-items";
import { MinusIcon, PlusIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  selectedItems: Record<number, number>;
  setSelectedItems: React.Dispatch<
    React.SetStateAction<Record<number, number>>
  >;
  onChange: (selectedItems: Record<number, number>) => void;
  onClose: () => void;
}

export function ChangeItemsDialog({
  children,
  onChange,
  selectedItems,
  setSelectedItems,
  onClose,
}: Props) {
  const { data: itemsData } = useItems();
  const [open, setOpen] = useState(false);

  const handleQuantityChange = (itemId: number, quantity: string) => {
    const numQuantity = parseInt(quantity) || 0;
    if (numQuantity >= 0) {
      const newSelectedItems = {
        ...selectedItems,
        [itemId]: numQuantity,
      };
      setSelectedItems(newSelectedItems);
    }
  };

  const incrementQuantity = (itemId: number) => {
    const newSelectedItems = {
      ...selectedItems,
      [itemId]: (selectedItems[itemId] || 0) + 1,
    };
    setSelectedItems(newSelectedItems);
  };

  const decrementQuantity = (itemId: number) => {
    const newSelectedItems = {
      ...selectedItems,
      [itemId]: Math.max((selectedItems[itemId] || 0) - 1, 0),
    };
    setSelectedItems(newSelectedItems);
  };

  const calculateTotal = (price: number, quantity: number) => {
    return price * quantity;
  };

  const handleConfirm = () => {
    onChange?.(selectedItems);
    setOpen(false);
    onClose?.();
  };

  const handleCancel = () => {
    setOpen(false);
    onClose?.();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (open) {
          setOpen(true);
        } else {
          handleCancel();
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
          <DialogDescription>
            Thực hiện thay đổi cho việc thêm bớt sản phẩm ở đây. Nhấp vào xác
            nhận khi hoàn tất.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Table>
            <TableCaption>Sản phẩm</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Tên</TableHead>
                <TableHead>Số lượng</TableHead>
                <TableHead>Đơn giá</TableHead>
                <TableHead className="text-right">Tổng</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itemsData?.data?.map((item) => (
                <TableRow key={item.id} className="text-xs">
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-6"
                        onClick={() => decrementQuantity(item.id)}
                      >
                        <MinusIcon className="w-4 h-4" />
                      </Button>
                      <Input
                        type="number"
                        min="0"
                        value={selectedItems[item.id] || ""}
                        onChange={(e) =>
                          handleQuantityChange(item.id, e.target.value)
                        }
                        className="w-20 h-6 text-center"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-6"
                        onClick={() => incrementQuantity(item.id)}
                      >
                        <PlusIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(item.price)}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(
                      calculateTotal(item.price, selectedItems[item.id] || 0)
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <DialogFooter className="space-x-2">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Hủy
          </Button>
          <Button type="button" onClick={handleConfirm}>
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
