"use client";

import { useState, useTransition } from "react";
import { PlusIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createWorkout } from "@/actions/workouts";

interface Exercise {
  id: number;
  name: string;
  muscleGroup: string;
}

interface SetRow {
  reps: string;
  weight: string;
  unit: string;
}

interface ExerciseRow {
  exerciseId: string;
  sets: SetRow[];
}

function emptySet(): SetRow {
  return { reps: "", weight: "", unit: "kg" };
}

function emptyExercise(): ExerciseRow {
  return { exerciseId: "", sets: [emptySet()] };
}

export function AddWorkoutDialog({
  date,
  availableExercises,
}: {
  date: string;
  availableExercises: Exercise[];
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [exerciseRows, setExerciseRows] = useState<ExerciseRow[]>([emptyExercise()]);
  const [isPending, startTransition] = useTransition();

  function reset() {
    setName("");
    setExerciseRows([emptyExercise()]);
  }

  function addExercise() {
    setExerciseRows((prev) => [...prev, emptyExercise()]);
  }

  function removeExercise(ei: number) {
    setExerciseRows((prev) => prev.filter((_, i) => i !== ei));
  }

  function updateExercise(ei: number, exerciseId: string) {
    setExerciseRows((prev) =>
      prev.map((row, i) => (i === ei ? { ...row, exerciseId } : row))
    );
  }

  function addSet(ei: number) {
    setExerciseRows((prev) =>
      prev.map((row, i) => (i === ei ? { ...row, sets: [...row.sets, emptySet()] } : row))
    );
  }

  function removeSet(ei: number, si: number) {
    setExerciseRows((prev) =>
      prev.map((row, i) =>
        i === ei ? { ...row, sets: row.sets.filter((_, j) => j !== si) } : row
      )
    );
  }

  function updateSet(ei: number, si: number, field: keyof SetRow, value: string) {
    setExerciseRows((prev) =>
      prev.map((row, i) =>
        i === ei
          ? {
              ...row,
              sets: row.sets.map((s, j) => (j === si ? { ...s, [field]: value } : s)),
            }
          : row
      )
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const exercises = exerciseRows
      .filter((row) => row.exerciseId !== "")
      .map((row) => ({
        exerciseId: Number(row.exerciseId),
        sets: row.sets
          .filter((s) => s.reps !== "" && s.weight !== "")
          .map((s) => ({ reps: Number(s.reps), weight: Number(s.weight), unit: s.unit })),
      }));

    startTransition(async () => {
      await createWorkout({ name: name.trim(), date, exercises });
      setOpen(false);
      reset();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Workout
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Workout</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          <div className="space-y-1">
            <Label htmlFor="workout-name">Workout name</Label>
            <Input
              id="workout-name"
              placeholder="e.g. Upper Body Push"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium">Exercises</p>

            {exerciseRows.map((row, ei) => (
              <div key={ei} className="border rounded-lg p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <Select
                    value={row.exerciseId}
                    onValueChange={(v) => updateExercise(ei, v)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select exercise" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableExercises.map((ex) => (
                        <SelectItem key={ex.id} value={String(ex.id)}>
                          {ex.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {exerciseRows.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExercise(ei)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  {row.sets.map((s, si) => (
                    <div key={si} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-5">{si + 1}</span>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Reps"
                        value={s.reps}
                        onChange={(e) => updateSet(ei, si, "reps", e.target.value)}
                        className="w-20"
                      />
                      <Input
                        type="number"
                        min={0}
                        step="0.5"
                        placeholder="Weight"
                        value={s.weight}
                        onChange={(e) => updateSet(ei, si, "weight", e.target.value)}
                        className="w-24"
                      />
                      <Select
                        value={s.unit}
                        onValueChange={(v) => updateSet(ei, si, "unit", v)}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="lb">lb</SelectItem>
                        </SelectContent>
                      </Select>
                      {row.sets.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSet(ei, si)}
                        >
                          <TrashIcon className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addSet(ei)}
                  >
                    <PlusIcon className="h-3 w-3 mr-1" />
                    Add set
                  </Button>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addExercise} className="w-full">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add exercise
            </Button>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Saving…" : "Save workout"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
