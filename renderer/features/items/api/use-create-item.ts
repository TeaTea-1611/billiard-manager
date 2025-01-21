import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateItemArgs } from "main/modules/item/item.type";
import { toast } from "sonner";

export const useCreateItem = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (args: CreateItemArgs) => {
      return await window.ipc.api.item.create(args);
    },
    onSuccess(data) {
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
