import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { getAllExercises } from "@/data/exercises";
import { NewWorkoutForm } from "./NewWorkoutForm";

export default async function NewWorkoutPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const availableExercises = await getAllExercises();
  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="container mx-auto max-w-2xl py-10 px-4">
      <h1 className="text-2xl font-semibold mb-6">New Workout</h1>
      <NewWorkoutForm date={today} availableExercises={availableExercises} />
    </div>
  );
}
