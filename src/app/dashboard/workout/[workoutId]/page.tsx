import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { format } from "date-fns";
import { getAllExercises } from "@/data/exercises";
import { getWorkoutById } from "@/data/workouts";
import { EditWorkoutForm } from "./EditWorkoutForm";

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { workoutId } = await params;
  const id = Number(workoutId);
  if (isNaN(id)) notFound();

  const [workout, availableExercises] = await Promise.all([
    getWorkoutById(id, userId),
    getAllExercises(),
  ]);

  if (!workout) notFound();

  const initialDate = format(workout.performedAt, "yyyy-MM-dd");

  const initialExercises = workout.workoutExercises.map((we) => ({
    exerciseId: String(we.exerciseId),
    sets: we.sets.map((s) => ({
      reps: String(s.reps),
      weight: String(s.weight),
      unit: s.unit,
    })),
  }));

  return (
    <div className="container mx-auto max-w-2xl py-10 px-4">
      <h1 className="text-2xl font-semibold mb-6">Edit Workout</h1>
      <EditWorkoutForm
        workoutId={id}
        initialName={workout.name}
        initialDate={initialDate}
        initialExercises={initialExercises}
        availableExercises={availableExercises}
      />
    </div>
  );
}
