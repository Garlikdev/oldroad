"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "@/components/ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { getUser } from "@/lib/actions/service.action";
import { useEffect } from "react";

const FormSchema = z.object({
  pin: z.string().min(4, {
    message: "Pin musi mieć 4 znaki.",
  }),
});

type User = {
  name: string;
  id: number;
  pin: number;
};

interface PinEntryFormProps {
  onLogin: (user: User) => void;
}

export const PinEntryForm: React.FC<PinEntryFormProps> = ({ onLogin }) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });

  const { setFocus } = form;

  const retrieveUser = useMutation({
    mutationKey: ["retrieveUser"],
    mutationFn: async (pin: number) => {
      const user = await getUser(pin);
      if (user) {
        onLogin(user);
        return user;
      } else {
        toast({
          title: "Błąd",
          description: `Niepoprawny pin`,
          duration: 1000,
        });
      }
      return user;
    },
    onSuccess: (data) => {
      if (data) {
        toast({
          title: "Sukces",
          description: `Zalogowano`,
          className: "bg-green-400 dark:bg-green-700",
          duration: 1000,
        });
      }
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Błąd",
        description: `Nie udało się zalogować`,
        duration: 4000,
      });
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    retrieveUser.mutate(parseInt(data.pin));
  }

  useEffect(() => {
    setFocus("pin");
  }, [setFocus]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col items-center space-y-6"
      >
        <FormField
          control={form.control}
          name="pin"
          render={({ field }) => (
            <FormItem className="flex flex-col items-center gap-8">
              <FormLabel>Logowanie</FormLabel>
              <FormControl>
                <InputOTP maxLength={4} {...field} pattern={REGEXP_ONLY_DIGITS}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormDescription>Wprowadź pin.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Zaloguj</Button>
      </form>
    </Form>
  );
};
