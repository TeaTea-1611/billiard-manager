import { format } from "date-fns";
import { OrderWithBookingAndOrderItems } from "main/modules/order/order.type";

interface PrintInvoiceProps {
  orderInfo: OrderWithBookingAndOrderItems;
}

export const printInvoice = ({ orderInfo }: PrintInvoiceProps) => {
  const invoiceHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          /* Thiết lập kích thước trang in */
          @page {
            size: 80mm auto;  /* Chiều rộng 80mm, chiều cao tự động */
            margin: 0;
          }
          
          body {
            font-family: 'Courier New', monospace;
            width: 75mm;  /* Để lại lề 2.5mm mỗi bên */
            margin: 0 auto;
            padding: 3mm;
            font-size: 12px;
            line-height: 1.2;
          }

          /* Reset style cho in */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          .header {
            text-align: center;
            margin-bottom: 5mm;
          }

          .shop-name {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 2mm;
          }

          .divider {
            border-bottom: 1px dashed #000;
            margin: 2mm 0;
          }

          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 1mm 0;
          }

          .item-row {
            margin: 2mm 0;
          }

          .item-name {
            font-weight: bold;
          }

          .item-details {
            display: flex;
            justify-content: space-between;
            padding-left: 3mm;
          }

          .total-section {
            margin-top: 3mm;
            text-align: right;
            font-weight: bold;
          }

          .footer {
            text-align: center;
            margin-top: 5mm;
            font-size: 11px;
          }

          @media print {
            body { 
              width: 75mm;
              -webkit-print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="shop-name">PHIẾU TÍNH TIỀN</div>
          <div>${format(
            orderInfo.payedAt || new Date(),
            "HH:mm dd/MM/yyyy"
          )}</div>
        </div>

        <div class="divider"></div>

        <div class="info-row">
          <span>Số HĐ:</span>
          <span>#${orderInfo.id}</span>
        </div>
        <div class="info-row">
          <span>Khách hàng:</span>
          <span>${orderInfo.customerName || "Khách lẻ"}</span>
        </div>
        ${
          orderInfo.phoneNumber
            ? `
          <div class="info-row">
            <span>SĐT:</span>
            <span>${orderInfo.phoneNumber}</span>
          </div>
        `
            : ""
        }
        ${
          orderInfo.booking
            ? `
          <div class="info-row">
            <span>Bàn:</span>
            <span>${orderInfo.booking.tableName}</span>
          </div>
           <div class="info-row">
            <span>Giá:</span>
            <span>${orderInfo.booking.hourlyRate.toLocaleString()}đ/giờ</span>
          </div>
          <div class="info-row">
            <span>Bắt đầu:</span>
            <span>${format(
              orderInfo.booking.startTime,
              "HH:mm dd/MM/yyyy"
            )}</span>
          </div>
          ${
            orderInfo.booking.endTime
              ? `
            <div class="info-row">
              <span>Kết thúc:</span>
              <span>${format(
                orderInfo.booking.endTime,
                "HH:mm dd/MM/yyyy"
              )}</span>
            </div>
          `
              : ""
          }
        `
            : ""
        }

        <div class="divider"></div>

        ${orderInfo.orderItems
          .map(
            (item) => `
          <div class="item-row">
            <div class="item-name">${item.name}</div>
            <div class="item-details">
              <span>${item.quantity} x ${item.price.toLocaleString()}đ</span>
              <span>${item.totalAmount.toLocaleString()}đ</span>
            </div>
          </div>
        `
          )
          .join("")}

        <div class="divider"></div>

        <div class="total-section">
          <div class="info-row">
            <span>Tổng tiền:</span>
            <span>${orderInfo.totalAmount.toLocaleString()}đ</span>
          </div>
        </div>

        <div class="divider"></div>

        <div class="footer">
          <p>Cảm ơn quý khách!</p>
          <p>Hẹn gặp lại</p>
        </div>
      </body>
    </html>
  `;

  const printWindow = window.open("", "_blank", "height=600,width=300");
  if (!printWindow) return;

  printWindow.document.write(invoiceHTML);
  printWindow.document.close();
  printWindow.focus();

  // Xử lý sự kiện in
  const handlePrint = () => {
    try {
      printWindow.print();
    } catch (error) {
      console.error("Lỗi khi in:", error);
    }
  };

  // Xử lý sự kiện trước khi đóng
  printWindow.onbeforeunload = () => {
    printWindow.onafterprint = null;
    printWindow.onbeforeunload = null;
  };

  // Đợi nội dung load xong
  if (printWindow.document.readyState === "complete") {
    handlePrint();
  } else {
    printWindow.onload = handlePrint;
  }
};
