"use server";

import prisma from "@/lib/db";
import { type Prisma } from "@prisma/client";
import moment from "moment-timezone";

type UserServicePrice = {
  userId: number;
  serviceId: number;
  price: number;
};

type EditBooking = {
  serviceId: number;
  price: number;
  createdAt: Date;
};

export type BookingChartData = {
  price: number;
  createdAt: Date;
};

export async function getUserServices(userId: number) {
  const services = await prisma.service.findMany({
    where: {
      prices: {
        some: {
          userId,
        },
      },
    },
  });
  return services;
}

export async function getUserProducts(userId: number) {
  const products = await prisma.product.findMany({
    where: {
      userId,
    },
  });
  return products;
}

// Users

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

export async function getTodaySumBookings(userId?: number) {
  const filterDate = getStartOfTodayInPoland();
  const endDate = getEndOfTodayInPoland();

  const bookings = await prisma.booking.findMany({
    where: {
      createdAt: {
        gte: filterDate,
        lt: endDate,
      },
      ...(userId && { userId }),
    },
    select: {
      price: true,
    },
  });

  const totalSumBookings = bookings.reduce(
    (sum, booking) => sum + booking.price,
    0,
  );

  return totalSumBookings;
}

export async function getTodaySumProducts(userId?: number) {
  const filterDate = getStartOfTodayInPoland();
  const endDate = getEndOfTodayInPoland();

  const products = await prisma.product.findMany({
    where: {
      createdAt: {
        gte: filterDate,
        lt: endDate,
      },
      ...(userId && { userId }),
    },
    select: {
      price: true,
    },
  });

  const totalSumProducts = products.reduce(
    (sum, product) => sum + product.price,
    0,
  );

  return totalSumProducts;
}

export async function getTodayStart(_userId?: number) {
  const filterDate = getStartOfTodayInPoland();
  const endDate = getEndOfTodayInPoland();

  const start = await prisma.start.findFirst({
    where: {
      createdAt: {
        gte: filterDate,
        lt: endDate,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      price: true,
    },
  });

  const startPrice = start ? start.price : 0;
  return startPrice;
}

export async function getTodayBookingCount(userId?: number) {
  const filterDate = getStartOfTodayInPoland();
  const endDate = getEndOfTodayInPoland();

  const bookingCount = await prisma.booking.count({
    where: {
      createdAt: {
        gte: filterDate,
        lt: endDate,
      },
      ...(userId && { userId }),
    },
  });

  return bookingCount;
}

// Legacy functions for backward compatibility
export async function getTodaySumBookingsLegacy() {
  return getTodaySumBookings();
}

export async function getTodaySumProductsLegacy() {
  return getTodaySumProducts();
}

export async function getTodayStartLegacy() {
  return getTodayStart();
}

export async function getAllBookings(userId: number, date?: string) {
  const timezone = "Europe/Warsaw"; // GMT+2

  const filterDate = date
    ? moment.tz(date, timezone).startOf("day")
    : moment.tz(timezone).startOf("day");

  const endDate = moment(filterDate).endOf("day");

  const isAdmin = await isUserAdmin(userId);

  let bookings;
  if (isAdmin) {
    bookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: filterDate.toDate(),
          lt: endDate.toDate(),
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        service: true,
        user: true,
      },
    });
  } else {
    bookings = await prisma.booking.findMany({
      where: {
        userId,
        createdAt: {
          gte: filterDate.toDate(),
          lt: endDate.toDate(),
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        service: true,
        user: true,
      },
    });
  }

  return bookings;
}
export async function getAllProducts(userId: number, date?: string) {
  const timezone = "Europe/Warsaw"; // GMT+2

  const filterDate = date
    ? moment.tz(date, timezone).startOf("day")
    : moment.tz(timezone).startOf("day");

  const endDate = moment(filterDate).endOf("day");

  const isAdmin = await isUserAdmin(userId);

  let products;
  if (isAdmin) {
    products = await prisma.product.findMany({
      where: {
        createdAt: {
          gte: filterDate.toDate(),
          lt: endDate.toDate(),
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
      },
    });
  } else {
    products = await prisma.product.findMany({
      where: {
        userId,
        createdAt: {
          gte: filterDate.toDate(),
          lt: endDate.toDate(),
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
      },
    });
  }

  return products;
}

export async function getAllBookingsChart(
  userId: number,
  startDate: string,
  endDate: string,
): Promise<BookingChartData[]> {
  const timezone = "Europe/Warsaw";

  try {
    const filterStart = moment.tz(startDate, timezone).startOf("day");
    const filterEnd = moment.tz(endDate, timezone).endOf("day");

    const isAdmin = await isUserAdmin(userId);

    const whereClause: Prisma.BookingWhereInput = {
      AND: [
        { createdAt: { gte: filterStart.toDate() } },
        { createdAt: { lte: filterEnd.toDate() } },
        !isAdmin ? { userId } : {},
      ],
    };

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      select: {
        price: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return bookings;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch bookings");
  }
}

export async function getBookingById(bookingId: number) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: true,
      user: true,
    },
  });
  return booking;
}

export async function editBooking(bookingId: number, data: EditBooking) {
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data,
  });
  return booking;
}

export async function getBookingsByUser(userId: number, date?: Date) {
  const timezone = "Europe/Warsaw"; // GMT+2

  const filterDate = date
    ? moment.tz(date, timezone).startOf("day")
    : moment.tz(timezone).startOf("day");

  const endDate = moment(filterDate).endOf("day");

  const bookings = await prisma.booking.findMany({
    where: {
      userId,
      createdAt: {
        gte: filterDate.toDate(),
        lt: endDate.toDate(),
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      service: true,
      user: true,
    },
  });

  return bookings;
}

export async function createBooking(data: {
  userId: number;
  serviceId: number;
  createdAt: Date;
  price: number;
}) {
  try {
    const { userId, serviceId, price, createdAt } = data;

    const newBooking = await prisma.booking.create({
      data: {
        userId,
        createdAt,
        serviceId,
        price,
      },
    });

    return newBooking;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function createProduct(data: {
  userId: number;
  name: string;
  createdAt: Date;
  price: number;
}) {
  try {
    const { userId, name, price, createdAt } = data;

    const newProduct = await prisma.product.create({
      data: {
        userId,
        createdAt,
        name,
        price,
      },
    });

    return newProduct;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getUserServicePrice(userId: number, serviceId: number) {
  try {
    const userServicePrice: UserServicePrice | null =
      await prisma.userServicePrice.findUnique({
        where: {
          userId_serviceId: {
            userId,
            serviceId,
          },
        },
      });

    return userServicePrice ? userServicePrice.price : null;
  } catch {
    console.error("Brak ustalonej ceny usługi");
    return null;
  }
}

export async function setUserServicePrice(userId: number, serviceId: number, price: number) {
  try {
    const userServicePrice = await prisma.userServicePrice.upsert({
      where: {
        userId_serviceId: {
          userId,
          serviceId,
        },
      },
      update: {
        price,
      },
      create: {
        userId,
        serviceId,
        price,
      },
    });

    return userServicePrice;
  } catch (error) {
    console.error("Błąd podczas ustawiania ceny usługi:", error);
    throw new Error("Nie udało się ustawić ceny usługi");
  }
}

export async function getUserServicePrices(userId: number) {
  try {
    const userServicePrices = await prisma.userServicePrice.findMany({
      where: {
        userId,
      },
      include: {
        service: true,
      },
      orderBy: {
        service: {
          name: "asc",
        },
      },
    });

    return userServicePrices;
  } catch (error) {
    console.error("Błąd podczas pobierania cen usług:", error);
    throw new Error("Nie udało się pobrać cen usług");
  }
}

import { getStartOfTodayInPoland, getEndOfTodayInPoland } from "@/lib/utils";

export async function getDashboardData(userId: number) {
  // Use centralized timezone utilities
  const filterDate = getStartOfTodayInPoland();
  const endDate = getEndOfTodayInPoland();

  // Check if user is admin
  const isAdmin = await isUserAdmin(userId);

  // Single query to get all dashboard data
  const [
    userBookingsResult,
    userProductsResult,
    startResult,
    userBookingCountResult,
    allBookingsResult,
    allProductsResult,
    allBookingCountResult
  ] = await Promise.all([
    // User bookings sum
    prisma.booking.aggregate({
      where: {
        userId,
        createdAt: {
          gte: filterDate,
          lt: endDate,
        },
      },
      _sum: {
        price: true,
      },
    }),

    // User products sum
    prisma.product.aggregate({
      where: {
        userId,
        createdAt: {
          gte: filterDate,
          lt: endDate,
        },
      },
      _sum: {
        price: true,
      },
    }),

    // Global start cash
    prisma.start.findFirst({
      where: {
        createdAt: {
          gte: filterDate,
          lt: endDate,
        },
      },
      select: {
        price: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    // User booking count
    prisma.booking.count({
      where: {
        userId,
        createdAt: {
          gte: filterDate,
          lt: endDate,
        },
      },
    }),

    // All bookings sum (only for admin)
    isAdmin ? prisma.booking.aggregate({
      where: {
        createdAt: {
          gte: filterDate,
          lt: endDate,
        },
      },
      _sum: {
        price: true,
      },
    }) : Promise.resolve(null),

    // All products sum (only for admin)
    isAdmin ? prisma.product.aggregate({
      where: {
        createdAt: {
          gte: filterDate,
          lt: endDate,
        },
      },
      _sum: {
        price: true,
      },
    }) : Promise.resolve(null),

    // All booking count (only for admin)
    isAdmin ? prisma.booking.count({
      where: {
        createdAt: {
          gte: filterDate,
          lt: endDate,
        },
      },
    }) : Promise.resolve(null),
  ]);

  return {
    // User data (always returned)
    userBookings: userBookingsResult._sum.price || 0,
    userProducts: userProductsResult._sum.price || 0,
    userBookingCount: userBookingCountResult,
    startCash: startResult?.price || 0,

    // Admin data (only returned if user is admin)
    ...(isAdmin && {
      allBookings: allBookingsResult?._sum.price || 0,
      allProducts: allProductsResult?._sum.price || 0,
      allBookingCount: allBookingCountResult || 0,
    }),

    isAdmin,
  };
}

// startowy hajs
export async function createStart(data: { createdAt: Date; price: number }) {
  try {
    const { price, createdAt } = data;

    // Check if a start entry already exists for today
    const timezone = "Europe/Warsaw"; // GMT+2
    const today = moment(createdAt).format("YYYY-MM-DD");
    const filterDate = moment.tz(today, timezone).startOf("day");
    const endDate = moment(filterDate).endOf("day");

    const existingStart = await prisma.start.findFirst({
      where: {
        createdAt: {
          gte: filterDate.toDate(),
          lt: endDate.toDate(),
        },
      },
    });

    if (existingStart) {
      throw new Error("Startowy hajs został już dodany na dzisiaj");
    }

    const newStart = await prisma.start.create({
      data: {
        price,
        createdAt,
      },
    });

    return newStart;
  } catch (err) {
    console.error(err);
    throw err; // Re-throw to handle in the UI
  }
}

export async function getAllStarts(date?: string) {
  const timezone = "Europe/Warsaw"; // GMT+2

  const filterDate = date
    ? moment.tz(date, timezone).startOf("day")
    : moment.tz(timezone).startOf("day");

  const endDate = moment(filterDate).endOf("day");

  const starts = await prisma.start.findMany({
    where: {
      createdAt: {
        gte: filterDate.toDate(),
        lt: endDate.toDate(),
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return starts;
}

export async function updateUserServicePrice(userId: number, serviceId: number, price: number) {
  return setUserServicePrice(userId, serviceId, price);
}
