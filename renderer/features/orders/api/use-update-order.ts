import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateOrderArgs } from "main/modules/order/order.type";
import { toast } from "sonner";

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (args: UpdateOrderArgs) => {
      return await window.ipc.api.order.update(args);
    },
    onSuccess(data) {
      toast[data.success ? "success" : "error"](data.message);

      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: ["orders"],
        });
      }
    },
  });

  return mutation;
};
