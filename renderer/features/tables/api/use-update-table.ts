import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateTableArgs } from "main/modules/table/table.type";
import { toast } from "sonner";

export const useUpdateTable = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (args: UpdateTableArgs) => {
      return await window.ipc.api.table.update(args);
    },
    onSuccess(data, variables) {
      toast[data.success ? "success" : "error"](data.message);

      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: ["table", variables.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["tables"],
        });
      }
    },
  });

  return mutation;
};
