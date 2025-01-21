"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useClickOutside from "@/hooks/use-click-ouside";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, PlusIcon } from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateTable } from "../api/use-create-table";

const formSchema = z.object({
  name: z.string().min(1),
  hourlyRate: z.coerce.number(),
});

export const CreateTable = () => {
  const uniqueId = useId();
  const formContainerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { mutate, isPending } = useCreateTable();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      hourlyRate: 20000,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    mutate(values);
  }

  const openMenu = () => {
    setIsOpen(true);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  useClickOutside(formContainerRef, () => {
    closeMenu();
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <MotionConfig
      transition={{
        type: "spring",
        bounce: 0.05,
        duration: 0.3,
      }}
    >
      <div className="relative flex items-center justify-center">
        <Button variant="outline" size="sm" asChild>
          <motion.button
            key="button"
            layoutId={`popover-${uniqueId}`}
            onClick={openMenu}
            className="!rounded-lg"
          >
            <PlusIcon className="size-4" />
            Thêm
          </motion.button>
        </Button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={formContainerRef}
              layoutId={`popover-${uniqueId}`}
              className="absolute z-50 !rounded-lg h-40 w-80 overflow-hidden border bg-card top-0 right-0 shadow-md"
            >
              <Form {...form}>
                <form
                  className="flex flex-col h-full gap-2 p-2"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} placeholder="Thêm bàn" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hourlyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Giá / giờ"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div
                    key="close"
                    className="flex items-center justify-between mt-auto"
                  >
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-full hover:bg-accent size-6"
                      onClick={closeMenu}
                      aria-label="Close popover"
                    >
                      <ArrowLeftIcon className="size-4" />
                    </button>
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        closeMenu();
                      }}
                      disabled={isPending}
                    >
                      Xác nhận
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
};
