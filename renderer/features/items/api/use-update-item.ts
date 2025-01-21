import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateItemArgs } from "main/modules/item/item.type";
import { toast } from "sonner";

export const useUpdateItem = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (args: UpdateItemArgs) => {
      return await window.ipc.api.item.update(args);
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
