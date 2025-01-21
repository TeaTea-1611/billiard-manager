import { AppLayout } from "@/components/app-layout";
import { Order } from "@prisma/client";
import { ReactElement, useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface DailyRevenue {
  date: string;
  totalAmount: number;
}

// Hàm chuyển đổi format
const transformOrdersToDaily = (orders: Order[]): DailyRevenue[] => {
  // Nhóm orders theo ngày và tính tổng
  const dailyTotals = orders.reduce((acc, order) => {
    const date = new Date(order.payedAt as Date).toISOString().split("T")[0];

    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += order.totalAmount;
    return acc;
  }, {} as Record<string, number>);

  // Chuyển đổi thành mảng kết quả
  return Object.entries(dailyTotals)
    .map(([date, totalAmount]) => ({
      date,
      totalAmount,
    }))
    .sort((a, b) => a.date.localeCompare(b.date)); // Sắp xếp theo ngày
};

const chartConfig = {
  views: {
    label: "Tổng",
  },
  totalAmount: {
    label: "Tổng doanh thu",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function Page() {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.ipc.api.order
      .getAllOrders()
      .then((res) => {
        if (res.data) {
          setData(res.data);
        }
      })
      .catch(() => {
        toast.error("Lỗi khi tải dữ liệu.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const [activeChart, setActiveChart] =
    useState<keyof typeof chartConfig>("totalAmount");

  const chartData = useMemo(() => {
    if (data.length === 0) return [];
    return transformOrdersToDaily(data);
  }, [data]);

  const total = useMemo(
    () => ({
      totalAmount: chartData.reduce((acc, curr) => acc + curr.totalAmount, 0),
    }),
    [chartData]
  );

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch p-0 space-y-0 border-b sm:flex-row">
        <div className="flex flex-col justify-center flex-1 gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Biểu Đồ Thanh - Tương Tác</CardTitle>
          <CardDescription></CardDescription>
        </div>
        <div className="flex">
          {["totalAmount"].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("vi-VN", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("vi-VN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
