import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "./_components/DatePicker";
import { AddWorkoutDialog } from "./_components/AddWorkoutDialog";
import { getWorkoutsForUserOnDate } from "@/data/workouts";
import { getAllExercises } from "@/data/exercises";

interface Props {
  searchParams: Promise<{ date?: string }>;
}

export default async function DashboardPage({ searchParams }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { date: dateParam } = await searchParams;
  const date = dateParam ? parseISO(dateParam) : new Date();
  const dateString = format(date, "yyyy-MM-dd");

  const [workouts, availableExercises] = await Promise.all([
    getWorkoutsForUserOnDate(userId, date),
    getAllExercises(),
  ]);

  return (
    <div className="container mx-auto max-w-5xl py-10 px-4">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="shrink-0">
          <DatePicker selected={date} />
        </div>

        <div className="flex-1 space-y-4 min-w-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">
              Workouts on {format(date, "do MMM yyyy")}
            </h2>
          </div>

        {workouts.length === 0 ? (
          <p className="text-muted-foreground text-sm">No workouts logged for this date.</p>
        ) : (
          workouts.map((workout) => (
            <Link key={workout.id} href={`/dashboard/workout/${workout.id}`} className="block">
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{workout.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {workout.workoutExercises.map((we) => (
                    <div key={we.id} className="space-y-1">
                      <p className="text-sm font-medium">{we.exercise.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {we.sets.map((set) => (
                          <div key={set.id} className="flex items-center gap-1">
                            <Badge variant="secondary">{set.reps} reps</Badge>
                            <Badge variant="outline">{set.weight}{set.unit}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </Link>
          ))
        )}

          <AddWorkoutDialog date={dateString} availableExercises={availableExercises} />
        </div>
      </div>
    </div>
  );
}
