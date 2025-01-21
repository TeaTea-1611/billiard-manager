import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DeleteItemArgs } from "main/modules/item/item.type";
import { toast } from "sonner";

export const useRemoveItem = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (args: DeleteItemArgs) => {
      return await window.ipc.api.item.delete(args);
    },
    onSuccess(data, variables) {
      toast[data.success ? "success" : "error"](data.message);

      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: ["items"],
        });
      }
    },
  });

  return mutation;
};
