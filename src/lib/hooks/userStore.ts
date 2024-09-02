import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/user";

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user: User) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: "loggedInUser", // name of the item in localStorage
    },
  ),
);
