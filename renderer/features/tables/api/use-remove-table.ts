import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DeleteTableArgs } from "main/modules/table/table.type";
import { toast } from "sonner";

export const useRemoveTable = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (args: DeleteTableArgs) => {
      return await window.ipc.api.table.delete(args);
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
