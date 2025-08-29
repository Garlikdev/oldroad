"use server";

import prisma from "@/lib/db";
import moment from "moment-timezone";
import type { CreateStartData } from "./types";

export async function createStart(data: CreateStartData) {
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
