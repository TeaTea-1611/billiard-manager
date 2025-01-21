import { useQuery } from "@tanstack/react-query";

export const useTables = () => {
  const query = useQuery({
    queryKey: ["tables"],
    queryFn: async () => {
      return await window.ipc.api.table.tables();
    },
  });

  return query;
};
