import { Card } from "@/components/ui/card";
import { features } from "@/lib/constants";
import { Activity, Brain, Heart, LineChart, Salad, Users } from "lucide-react";

const iconMap = {
  Brain,
  LineChart,
  Salad,
  Users,
  Activity,
  Heart,
} as const;

export function Features() {
  return (
    <section id="features" className="bg-muted/50 py-16 md:py-24">
      <div className="container">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Everything you need to succeed
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = iconMap[feature.icon as keyof typeof iconMap];
            return (
              <Card
                key={feature.title}
                className="group relative overflow-hidden p-6 transition-all hover:shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <Icon className="mb-4 h-12 w-12 text-primary transition-transform group-hover:scale-110" />
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
