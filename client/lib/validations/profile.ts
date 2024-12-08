import * as z from "zod";

export const profileFormSchema = z.object({
  age: z.number().min(13).max(120),
  weight: z.number().min(30).max(300),
  height: z.number().min(100).max(250),
  fitnessLevel: z.enum(["beginner", "intermediate", "advanced"]),
  preferences: z.object({
    workoutTypes: z
      .array(z.string())
      .min(1, "Select at least one workout type"),
    dietaryRestrictions: z.array(z.string()),
    preferredWorkoutDuration: z.number().min(10).max(120),
    workoutDaysPerWeek: z.number().min(1).max(7),
  }),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
