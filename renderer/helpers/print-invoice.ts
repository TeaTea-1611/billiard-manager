import { formatCurrency } from "@/lib/utils";
import { MenuItem, Order, OrderItem, Table } from "@prisma/client";
import { formatDate } from "date-fns";
import { toast } from "sonner";

export const printInvoice = async (
  order: Order & {
    table?: Table;
    orderItems: (OrderItem & {
      menuItem: MenuItem;
    })[];
  },
) => {
  console.log(order);

  try {
    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${
          order.table ? `Hóa Đơn - Bàn ${order.table.name}` : "Hóa Đơn"
        }</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          h1 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .totals { text-align: right; }
        </style>
      </head>
      <body>
        <h1>Hóa Đơn</h1>
        ${!!order.table && `<p>Bàn: ${order.table.name}</p>`}
        <p>Ngày: ${formatDate(new Date(order.createdAt), "pp dd/MM/yy")}</p>
        
        <table>
          <thead>
            <tr>
              <th>Sản Phẩm</th>
              <th>Số Lượng</th>
              <th>Đơn Giá</th>
              <th>Tổng</th>
            </tr>
          </thead>
          <tbody>
            ${order?.orderItems
              ?.map(
                (item) => `
              <tr>
                <td>${item.menuItem.name}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.menuItem.price)}</td>
                <td>${formatCurrency(item.subtotal)}</td>
              </tr>
            `,
              )
              ?.join("")}
          </tbody>
        </table>

        <div class="totals">
          <p>Tiền bàn: ${formatCurrency(order.amountTable)}</p>
          <p>Tiền sản phẩm: ${formatCurrency(
            order.totalAmount - order.amountTable,
          )}</p>
          <h2>Tổng cộng: ${formatCurrency(order.totalAmount)}</h2>
        </div>
      </body>
      </html>
    `;

    const printResult = await window.ipc.invoke("print-invoice", {
      html: invoiceHtml,
      printOptions: {
        silent: false,
        printBackground: true,
      },
    });

    if (printResult.success) {
      toast.success("Đã in hóa đơn thành công");
    } else {
      toast.error("Lỗi in hóa đơn");
    }
  } catch (error) {
    console.error("Lỗi in hóa đơn:", error);
    toast.error("Không thể in hóa đơn");
  }
};
