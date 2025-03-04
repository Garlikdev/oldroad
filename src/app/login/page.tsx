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
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { getUser } from "@/lib/actions/service.action";
import { useEffect } from "react";
import { useUserStore } from "@/lib/hooks/userStore";
import type { User } from "@/types/user";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FormSchema = z.object({
  pin: z.string().min(4, {
    message: "Pin musi mieć 4 znaki.",
  }),
});

export default function Login() {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);

  const handleLogin = (userInfo: User) => {
    setUser(userInfo);
  };

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
        handleLogin(user);
        router.push("/");
        return user;
      } else {
        toast.error("Błąd", {
          description: `Niepoprawny pin`,
          duration: 1000,
        });
      }
      return user;
    },
    onSuccess: (data) => {
      if (data) {
        toast.success("Sukces", {
          description: `Zalogowano`,
          className: "bg-green-400 dark:bg-green-700",
          duration: 1000,
        });
      }
    },
    onError: () => {
      toast.error("Błąd", {
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
    <main className="relative flex min-h-screen w-full flex-col items-center gap-4 overflow-hidden py-4">
      <div className="container flex gap-4 px-1 sm:px-2">
        <div className="z-10 flex w-full flex-col items-center gap-4">
          <Card className="bg-background/80 relative z-10 w-full sm:w-fit">
            <CardHeader className="text-center">
              <CardTitle>Logowanie</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
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
                        <FormControl>
                          <InputOTP
                            maxLength={4}
                            {...field}
                            pattern={REGEXP_ONLY_DIGITS}
                          >
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
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
