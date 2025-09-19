"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema for creating new user
const createUserSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana"),
  pin: z.string().min(1, "PIN jest wymagany"),
});

// Schema for updating user details
const updateUserSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Nazwa jest wymagana"),
  pin: z.string().min(1, "PIN jest wymagany"),
});

// Schema for assigning service to user
const assignServiceSchema = z.object({
  userId: z.number(),
  serviceId: z.number(),
  price: z.number().min(0, "Cena musi być większa lub równa 0"),
  enabled: z.boolean().optional().default(true),
});

// Check if user is admin
async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Brak uprawnień administratora");
  }
  return session;
}

// Get all users with their enabled service prices
export async function getAllUsers() {
  await requireAdmin();

  try {
    const users = await prisma.user.findMany({
      include: {
        prices: {
          where: {
            enabled: true, // Only show enabled services
          },
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return { success: true, data: users };
  } catch (error) {
    console.error("Błąd podczas pobierania użytkowników:", error);
    return { success: false, error: "Nie udało się pobrać listy użytkowników" };
  }
}

// Create new user
export async function createUser(data: z.infer<typeof createUserSchema>) {
  await requireAdmin();

  try {
    const validatedData = createUserSchema.parse(data);

    // Check if name is already taken
    const existingName = await prisma.user.findUnique({
      where: { name: validatedData.name },
    });

    if (existingName) {
      return { success: false, error: "Użytkownik o tej nazwie już istnieje" };
    }

    // Check if PIN is already taken
    const existingPin = await prisma.user.findUnique({
      where: { pin: validatedData.pin },
    });

    if (existingPin) {
      return { success: false, error: "PIN jest już używany przez innego użytkownika" };
    }

    const newUser = await prisma.user.create({
      data: {
        name: validatedData.name,
        pin: validatedData.pin,
        role: "USER", // Default role
      },
    });

    revalidatePath("/admin/pracownicy");

    return { success: true, data: newUser };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Nieprawidłowe dane" };
    }
    console.error("Błąd podczas tworzenia użytkownika:", error);
    return { success: false, error: "Nie udało się utworzyć użytkownika" };
  }
}

// Get single user with service prices
export async function getUserById(userId: number) {
  await requireAdmin();

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        prices: {
          include: {
            service: true,
          },
          orderBy: {
            service: {
              name: "asc",
            },
          },
        },
      },
    });

    if (!user) {
      return { success: false, error: "Użytkownik nie został znaleziony" };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error("Błąd podczas pobierania użytkownika:", error);
    return { success: false, error: "Nie udało się pobrać danych użytkownika" };
  }
}

// Get single user with ALL service prices (including disabled) for admin management
export async function getUserByIdWithAllServices(userId: number) {
  await requireAdmin();

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        prices: {
          include: {
            service: true,
          },
          orderBy: {
            service: {
              name: "asc",
            },
          },
        },
      },
    });

    if (!user) {
      return { success: false, error: "Użytkownik nie został znaleziony" };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error("Błąd podczas pobierania użytkownika:", error);
    return { success: false, error: "Nie udało się pobrać danych użytkownika" };
  }
}

// Update user details (name, pin)
export async function updateUser(data: z.infer<typeof updateUserSchema>) {
  await requireAdmin();

  try {
    const validatedData = updateUserSchema.parse(data);

    // Check if name is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        name: validatedData.name,
        id: { not: validatedData.id },
      },
    });

    if (existingUser) {
      return { success: false, error: "Użytkownik o tej nazwie już istnieje" };
    }

    // Check if PIN is already taken by another user
    const existingPin = await prisma.user.findFirst({
      where: {
        pin: validatedData.pin,
        id: { not: validatedData.id },
      },
    });

    if (existingPin) {
      return { success: false, error: "PIN jest już używany przez innego użytkownika" };
    }

    const updatedUser = await prisma.user.update({
      where: { id: validatedData.id },
      data: {
        name: validatedData.name,
        pin: validatedData.pin,
      },
    });

    revalidatePath("/admin/pracownicy");
    revalidatePath(`/admin/pracownicy/${validatedData.id}`);

    return { success: true, data: updatedUser };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Nieprawidłowe dane" };
    }
    console.error("Błąd podczas aktualizacji użytkownika:", error);
    return { success: false, error: "Nie udało się zaktualizować użytkownika" };
  }
}

// Get all services for dropdown
export async function getAllServices() {
  await requireAdmin();

  try {
    const services = await prisma.service.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return { success: true, data: services };
  } catch (error) {
    console.error("Błąd podczas pobierania usług:", error);
    return { success: false, error: "Nie udało się pobrać listy usług" };
  }
}

// Assign service to user with price
export async function assignServiceToUser(data: z.infer<typeof assignServiceSchema>) {
  await requireAdmin();

  try {
    const validatedData = assignServiceSchema.parse(data);

    // Check if user and service exist
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
    });

    if (!user) {
      return { success: false, error: "Użytkownik nie został znaleziony" };
    }

    const service = await prisma.service.findUnique({
      where: { id: validatedData.serviceId },
    });

    if (!service) {
      return { success: false, error: "Usługa nie została znaleziona" };
    }

    // Use upsert to either create or update the price and enabled status
    const userServicePrice = await prisma.userServicePrice.upsert({
      where: {
        userId_serviceId: {
          userId: validatedData.userId,
          serviceId: validatedData.serviceId,
        },
      },
      create: {
        userId: validatedData.userId,
        serviceId: validatedData.serviceId,
        price: validatedData.price,
        enabled: validatedData.enabled,
      },
      update: {
        price: validatedData.price,
        enabled: validatedData.enabled,
      },
      include: {
        service: true,
      },
    });

    revalidatePath(`/admin/pracownicy/${validatedData.userId}`);

    return { success: true, data: userServicePrice };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Nieprawidłowe dane" };
    }
    console.error("Błąd podczas przypisywania usługi:", error);
    return { success: false, error: "Nie udało się przypisać usługi do użytkownika" };
  }
}

// Disable service for user (instead of deleting)
export async function removeServiceFromUser(userId: number, serviceId: number) {
  await requireAdmin();

  try {
    // Instead of deleting, set enabled to false
    await prisma.userServicePrice.update({
      where: {
        userId_serviceId: {
          userId,
          serviceId,
        },
      },
      data: {
        enabled: false,
      },
    });

    revalidatePath(`/admin/pracownicy/${userId}`);

    return { success: true };
  } catch (error) {
    // If the record doesn't exist, that's fine - it's already "disabled"
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return { success: true };
    }
    
    console.error("Błąd podczas wyłączania usługi:", error);
    return { success: false, error: "Nie udało się wyłączyć usługi dla użytkownika" };
  }
}