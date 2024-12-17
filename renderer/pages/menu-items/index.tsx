import { AppLayout } from "@/components/app-layout";
import { AddMenuItemDialog } from "@/components/menu-items/add-menu-item-dialog";
import { RemoveMenuItemDialog } from "@/components/menu-items/remove-menu-item-dialog";
import { UpdateMenuItemDialog } from "@/components/menu-items/update-menu-item-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMenuStore } from "@/hooks/use-menu-store";
import { MenuItem } from "@prisma/client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDownIcon, MoreHorizontalIcon, PlusIcon } from "lucide-react";
import { ReactElement, useEffect, useState } from "react";

const categories = ["Đồ ăn", "Thức uống", "Khác"];

export const columns: ColumnDef<MenuItem>[] = [
  {
    accessorKey: "name",
    header: "Tên",
  },
  {
    accessorKey: "category",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Loại
          <ArrowUpDownIcon className="w-4 h-4 ml-2" />
        </Button>
      );
    },
    cell({ row }) {
      return categories[row.original.category];
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Giá
          <ArrowUpDownIcon className="w-4 h-4 ml-2" />
        </Button>
      );
    },
    cell({ row }) {
      return row.original.price.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      });
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const menuItem = row.original;

      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-8 h-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontalIcon className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Tác vụ</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <UpdateMenuItemDialog initialData={menuItem}>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                }}
              >
                Xem chỉnh sửa
              </DropdownMenuItem>
            </UpdateMenuItemDialog>
            <RemoveMenuItemDialog menuItemId={menuItem.id}>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                }}
              >
                Xóa
              </DropdownMenuItem>
            </RemoveMenuItemDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function Page() {
  const [sorting, setSorting] = useState<SortingState>([]);

  const data = useMenuStore((state) => state.data);
  const fetchMenuItems = useMenuStore((state) => state.fetchData);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Danh mục</h1>
        <AddMenuItemDialog>
          <Button
            size="sm"
            className="text-white bg-primary hover:bg-primary-dark"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Thêm món
          </Button>
        </AddMenuItemDialog>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Không có kết quả
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
