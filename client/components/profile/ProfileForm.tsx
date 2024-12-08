"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { profileFormSchema } from "@/lib/validations/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";

const workoutTypes = [
  { id: "yoga", label: "Yoga" },
  { id: "strength", label: "Strength Training" },
  { id: "cardio", label: "Cardio" },
  { id: "hiit", label: "HIIT" },
  { id: "pilates", label: "Pilates" },
];

const dietaryRestrictions = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten-free", label: "Gluten Free" },
  { id: "dairy-free", label: "Dairy Free" },
];

export default function ProfileForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      age: 25,
      weight: 70,
      height: 170,
      fitnessLevel: "beginner",
      preferences: {
        workoutTypes: [],
        dietaryRestrictions: [],
        preferredWorkoutDuration: 30,
        workoutDaysPerWeek: 3,
      },
    },
  });

  function onSubmit(values: z.infer<typeof profileFormSchema>) {
    console.log(values);
    router.push("/dashboard");
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 bg-white p-6 rounded-lg shadow-sm"
      >
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-900">Age</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-900">Weight (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-900">Height (cm)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fitnessLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-900">
                    Fitness Level
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your fitness level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900">
              Workout Preferences
            </h3>
            <FormField
              control={form.control}
              name="preferences.workoutTypes"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base text-slate-900">
                      Workout Types
                    </FormLabel>
                    <FormDescription className="text-slate-500">
                      Select the types of workouts you prefer
                    </FormDescription>
                  </div>
                  {workoutTypes.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="preferences.workoutTypes"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, item.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal text-slate-900">
                              {item.label}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900">
              Dietary Restrictions
            </h3>
            <FormField
              control={form.control}
              name="preferences.dietaryRestrictions"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base text-slate-900">
                      Restrictions
                    </FormLabel>
                    <FormDescription className="text-slate-500">
                      Select any dietary restrictions you have
                    </FormDescription>
                  </div>
                  {dietaryRestrictions.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="preferences.dietaryRestrictions"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, item.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal text-slate-900">
                              {item.label}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" className="w-full">
          Save Profile
        </Button>
      </form>
    </Form>
  );
}
