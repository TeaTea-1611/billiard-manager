import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateOrderArgs } from "main/modules/order/order.type";
import { toast } from "sonner";

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (args: CreateOrderArgs) => {
      return await window.ipc.api.order.create(args);
    },
    onSuccess(data) {
      toast[data.success ? "success" : "error"](data.message);

      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: ["orders"],
        });
        queryClient.invalidateQueries({
          queryKey: ["tables"],
        });
      }
    },
  });

  return mutation;
};
