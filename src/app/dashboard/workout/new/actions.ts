"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createWorkout } from "@/data/workouts";

const setSchema = z.object({
  reps: z.number().int().min(1),
  weight: z.number().min(0),
  unit: z.enum(["kg", "lb"]),
});

const exerciseSchema = z.object({
  exerciseId: z.number().int().positive(),
  sets: z.array(setSchema).min(1),
});

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  exercises: z.array(exerciseSchema).min(1),
});

export async function createWorkoutAction(params: {
  name: string;
  date: string;
  exercises: { exerciseId: number; sets: { reps: number; weight: number; unit: string }[] }[];
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = createWorkoutSchema.safeParse(params);
  if (!parsed.success) throw new Error("Invalid input");

  const { name, date, exercises } = parsed.data;
  const performedAt = new Date(`${date}T00:00:00`);

  await createWorkout(userId, name, performedAt, exercises);

  revalidatePath("/dashboard");
}
