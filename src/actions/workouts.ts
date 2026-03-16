"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { workouts, workoutExercises, sets } from "@/db/schema";

interface SetInput {
  reps: number;
  weight: number;
  unit: string;
}

interface ExerciseInput {
  exerciseId: number;
  sets: SetInput[];
}

interface CreateWorkoutInput {
  name: string;
  date: string; // yyyy-MM-dd
  exercises: ExerciseInput[];
}

export async function createWorkout(input: CreateWorkoutInput) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const performedAt = new Date(`${input.date}T00:00:00`);

  const [workout] = await db
    .insert(workouts)
    .values({ userId, name: input.name, performedAt })
    .returning({ id: workouts.id });

  for (let i = 0; i < input.exercises.length; i++) {
    const ex = input.exercises[i];

    const [we] = await db
      .insert(workoutExercises)
      .values({ workoutId: workout.id, exerciseId: ex.exerciseId, orderIndex: i })
      .returning({ id: workoutExercises.id });

    if (ex.sets.length > 0) {
      await db.insert(sets).values(
        ex.sets.map((s, idx) => ({
          workoutExerciseId: we.id,
          setNumber: idx + 1,
          reps: s.reps,
          weight: String(s.weight),
          unit: s.unit,
        }))
      );
    }
  }

  revalidatePath("/dashboard");
}
