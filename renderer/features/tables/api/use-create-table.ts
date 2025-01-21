import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateTableArgs } from "main/modules/table/table.type";
import { toast } from "sonner";

export const useCreateTable = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (args: CreateTableArgs) => {
      return await window.ipc.api.table.create(args);
    },
    onSuccess(data) {
      toast[data.success ? "success" : "error"](data.message);

      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: ["tables"],
        });
      }
    },
  });

  return mutation;
};
