import "server-only";
import { connection } from "next/server";
import { getToday } from "@/lib/care-schedule";

export const getRequestToday = async () => {
  await connection();
  return getToday();
};
