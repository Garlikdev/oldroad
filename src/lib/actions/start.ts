"use server";

import prisma from "@/lib/db";
import moment from "moment-timezone";
import type { CreateStartData } from "./types";

export async function createStart(data: CreateStartData) {
  try {
    const { price, createdAt } = data;

    // Check if a start entry already exists for the selected date
    const timezone = "Europe/Warsaw"; // GMT+2
    const selectedDate = moment(createdAt).format("YYYY-MM-DD");
    const filterDate = moment.tz(selectedDate, timezone).startOf("day");
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
      const formattedDate = moment(createdAt).format("DD/MM/YYYY");
      throw new Error(`Startowy hajs został już dodany na dzień ${formattedDate}`);
    }

    const newStart = await prisma.start.create({
      data: {
        price,
        createdAt,
      },
    });

    return newStart;
  } catch (err) {
    console.error("Błąd podczas dodawania startowego hajsu:", err);
    
    // Provide more specific error messages in Polish
    if (err instanceof Error) {
      throw new Error(err.message);
    } else {
      throw new Error("Wystąpił nieznany błąd podczas dodawania startowego hajsu");
    }
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

export async function getStartById(startId: number) {
  try {
    const start = await prisma.start.findUnique({
      where: { id: startId },
    });
    return start;
  } catch (error) {
    console.error("Błąd podczas pobierania startowego hajsu:", error);
    throw new Error("Nie udało się pobrać danych startowego hajsu");
  }
}

export async function updateStart(startId: number, data: { price: number; createdAt: Date }) {
  try {
    const { price, createdAt } = data;

    // Check if another start entry exists for the same date (excluding current entry)
    const timezone = "Europe/Warsaw";
    const selectedDate = moment(createdAt).format("YYYY-MM-DD");
    const filterDate = moment.tz(selectedDate, timezone).startOf("day");
    const endDate = moment(filterDate).endOf("day");

    const existingStart = await prisma.start.findFirst({
      where: {
        AND: [
          { id: { not: startId } }, // Exclude current entry
          {
            createdAt: {
              gte: filterDate.toDate(),
              lt: endDate.toDate(),
            },
          },
        ],
      },
    });

    if (existingStart) {
      const formattedDate = moment(createdAt).format("DD/MM/YYYY");
      throw new Error(`Startowy hajs już istnieje na dzień ${formattedDate}`);
    }

    const updatedStart = await prisma.start.update({
      where: { id: startId },
      data: {
        price,
        createdAt,
      },
    });

    return updatedStart;
  } catch (err) {
    console.error("Błąd podczas aktualizacji startowego hajsu:", err);
    
    if (err instanceof Error) {
      throw new Error(err.message);
    } else {
      throw new Error("Wystąpił nieznany błąd podczas aktualizacji startowego hajsu");
    }
  }
}

export async function deleteStart(startId: number) {
  try {
    const deletedStart = await prisma.start.delete({
      where: { id: startId },
    });
    return deletedStart;
  } catch (error) {
    console.error("Błąd podczas usuwania startowego hajsu:", error);
    throw new Error("Nie udało się usunąć startowego hajsu");
  }
}
