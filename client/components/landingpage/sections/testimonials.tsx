import { Card } from "@/components/ui/card";
import Image from "next/image";

const testimonials = [
  {
    name: "Dr. Sarah Johnson",
    role: "Department Head",
    content: "This scheduling platform has transformed how our department manages meetings. The automated scheduling saves hours of back-and-forth emails!",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    name: "Michael Chen",
    role: "Student Representative",
    content: "Booking appointments with professors has never been easier. I can see their available slots and schedule meetings instantly.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    name: "Emma Williams",
    role: "Research Coordinator",
    content: "Managing research group meetings across different time zones used to be a nightmare. This platform makes it effortless!",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100",
  },
] as const;

export function Testimonials() {
  return (
    <section id="testimonials" className="bg-gradient-to-br from-violet-50/50 via-transparent to-purple-50/50 py-16 md:py-24">
      <div className="container">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Trusted by Professionals
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="group relative overflow-hidden p-6 transition-all hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="mb-4 flex items-center space-x-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-full">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-110"
                  />
                </div>
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-600">{testimonial.content}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}