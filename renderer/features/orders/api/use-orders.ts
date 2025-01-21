import { useInfiniteQuery } from "@tanstack/react-query";

export const useOrders = () => {
  const query = useInfiniteQuery({
    queryKey: ["orders"],
    queryFn: async ({ pageParam }) => {
      return await window.ipc.api.order.orders({
        page: pageParam,
        take: 2,
      });
    },
    initialPageParam: 0,
    getPreviousPageParam: (firstPage) => firstPage.nextPage,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  return query;
};
