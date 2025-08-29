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
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

const FormSchema = z.object({
  pin: z.string().min(4, {
    message: "Pin musi mieć 4 znaki.",
  }),
});

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });

  const { setFocus } = form;

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const result = await signIn("credentials", {
        pin: data.pin,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Błąd", {
          description: "Niepoprawny PIN",
          duration: 1000,
        });
      } else if (result?.ok) {
        toast.success("Sukces", {
          description: "Zalogowano pomyślnie",
          duration: 1000,
        });
        router.push(from);
        router.refresh();
      }
    } catch (error) {
      toast.error("Błąd", {
        description: "Wystąpił błąd podczas logowania",
        duration: 4000,
      });
    }
  }

  useEffect(() => {
    setFocus("pin");
  }, [setFocus]);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="w-full space-y-4 text-center sm:w-fit">
        <h1>Logowanie</h1>
        <div className="flex items-center gap-4">
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
                        onComplete={() => {
                          // Auto-submit when all 4 digits are filled
                          form.handleSubmit(onSubmit)();
                        }}
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

              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Logowanie..." : "Zaloguj"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
