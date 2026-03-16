import { db } from "@/db";
import { workouts, workoutExercises, exercises, sets } from "@/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";

interface SetInput {
  reps: number;
  weight: number;
  unit: string;
}

interface ExerciseInput {
  exerciseId: number;
  sets: SetInput[];
}

export async function createWorkout(
  userId: string,
  name: string,
  performedAt: Date,
  exerciseInputs: ExerciseInput[]
) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, name, performedAt })
    .returning({ id: workouts.id });

  for (let i = 0; i < exerciseInputs.length; i++) {
    const ex = exerciseInputs[i];
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

  return workout;
}

export async function getWorkoutsForUserOnDate(userId: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const rows = await db.query.workouts.findMany({
    where: and(
      eq(workouts.userId, userId),
      gte(workouts.performedAt, startOfDay),
      lt(workouts.performedAt, endOfDay)
    ),
    with: {
      workoutExercises: {
        orderBy: (we, { asc }) => asc(we.orderIndex),
        with: {
          exercise: true,
          sets: {
            orderBy: (s, { asc }) => asc(s.setNumber),
          },
        },
      },
    },
  });

  return rows;
}
