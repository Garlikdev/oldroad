"use server";

import prisma from "@/lib/db";

export async function getUsers() {
  return prisma.user.findMany();
}

export async function getUser(pin: string) {
  const userData = await prisma.user.findUnique({
    where: { pin },
    select: {
      id: true,
      name: true,
      role: true,
      // Add other fields you want to include in the returned user data
      pin: false, // This excludes the pin field
    },
  });
  return userData ? userData : null;
}

// Helper function to check if user is admin
export async function isUserAdmin(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === 'ADMIN';
}
