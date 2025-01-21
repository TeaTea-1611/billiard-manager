import React, { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useOrders } from "../api/use-orders";
import { OrderCard } from "./order-card";
import { Button } from "@/components/ui/button";

export const Orders = () => {
  const { ref, inView } = useInView();

  const {
    status,
    data,
    error,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useOrders();

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-center">Hóa đơn</h1>
      {status === "pending" ? (
        <p className="text-center text-muted-foreground">Đang tải...</p>
      ) : status === "error" ? (
        <p className="text-center text-muted-foreground">
          Lỗi: {error.message}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {data.pages.map((page) => (
            <React.Fragment key={page.nextPage}>
              {page.data?.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </React.Fragment>
          ))}
          <div className="flex items-center justify-center">
            <Button
              variant={"ghost"}
              ref={ref}
              onClick={() => fetchNextPage()}
              disabled={!hasNextPage || isFetchingNextPage}
            >
              {isFetchingNextPage
                ? "Đang tải thêm..."
                : hasNextPage
                ? "Tải thêm"
                : "Không còn gì để tải"}
            </Button>
          </div>
          <div>
            {isFetching && !isFetchingNextPage
              ? "Background Updating..."
              : null}
          </div>
        </div>
      )}
    </div>
  );
};
