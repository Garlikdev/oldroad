import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "./userStore";

export const useAuth = () => {
  const user = useUserStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.push("/login");
    }
  }, [user, router]);

  return user;
};
