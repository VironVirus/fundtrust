import { Mail, MapPin, PhoneCall } from "lucide-react";

import { ContactForm } from "@/components/forms/contact-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContactPage() {
  return (
    <main className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            Contact
          </p>
          <h1 className="mt-4 font-display text-5xl text-foreground">
            Speak with the Fundtrust team.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            Reach out for onboarding support, deployment questions, or help
            configuring your Google Sheets and email provider.
          </p>

          <div className="mt-8 grid gap-4">
            {[
              {
                title: "Email support",
                value: "admin@fundtrust.app",
                icon: Mail,
              },
              {
                title: "Phone",
                value: "+234 800 000 0000",
                icon: PhoneCall,
              },
              {
                title: "Operations base",
                value: "Enugu, Nigeria",
                icon: MapPin,
              },
            ].map((item) => (
              <Card key={item.title} className="border-white/70 bg-white/88">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {item.title}
                    </p>
                    <p className="mt-1 font-semibold text-foreground">
                      {item.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Card className="border-white/70 bg-white/92">
          <CardHeader>
            <CardTitle>Send a message</CardTitle>
            <p className="text-sm leading-7 text-muted-foreground">
              We’ll route your request to the right team and follow up by email.
            </p>
          </CardHeader>
          <CardContent>
            <ContactForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
