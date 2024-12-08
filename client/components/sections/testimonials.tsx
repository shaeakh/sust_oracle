import { Card } from "@/components/ui/card";
import { testimonials } from "@/lib/constants";
import Image from "next/image";

export function Testimonials() {
  return (
    <section id="testimonials" className="py-16 md:py-24">
      <div className="container">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          What our users say
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.name}
              className="group p-6 transition-all hover:shadow-lg"
            >
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
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground">{testimonial.content}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
