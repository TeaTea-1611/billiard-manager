import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateBookingArgs } from "main/modules/booking/booking.type";
import { toast } from "sonner";

export const useBooking = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (args: CreateBookingArgs) => {
      return await window.ipc.api.booking.create(args);
    },
    onSuccess(data, variables) {
      toast[data.success ? "success" : "error"](data.message);

      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: ["table", variables.tableId],
        });
        queryClient.invalidateQueries({
          queryKey: ["tables"],
        });
      }
    },
  });

  return mutation;
};
