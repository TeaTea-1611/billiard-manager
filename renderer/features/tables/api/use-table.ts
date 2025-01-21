import { useQuery } from "@tanstack/react-query";

export const useTable = (id: number) => {
  const query = useQuery({
    queryKey: ["table", id],
    queryFn: async ({ queryKey }) => {
      const [, tableId] = queryKey;
      return await window.ipc.api.table.table({ id: Number(tableId) });
    },
  });

  return query;
};
