import { useQuery } from "@tanstack/react-query";

export const useItems = () => {
  const query = useQuery({
    queryKey: ["items"],
    queryFn: async () => {
      return await window.ipc.api.item.items();
    },
  });

  return query;
};
