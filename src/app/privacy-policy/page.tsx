import type { Metadata } from "next";
import Link from "next/link";

const SUPPORT_EMAIL = "digitantra.helpdesk@gmail.com";

export const metadata: Metadata = {
  title: "Privacy Policy | DigiTantra",
  description: "Read how DigiTantra collects, uses, stores, and protects personal information.",
};

const policySections = [
  {
    title: "Information We Collect",
    body:
      "We may collect the information you submit directly, such as your name, email address, phone number, enquiry details, and account-related inputs. We may also collect product usage information, device/browser details, and analytics events needed to operate and improve the platform.",
  },
  {
    title: "How We Use Information",
    body:
      "We use information to provide access to DigiTantra, respond to support requests, improve courses and product features, monitor platform performance, prevent abuse, and send important service communication. We do not need personal data for reasons unrelated to platform delivery and user support.",
  },
  {
    title: "Cookies And Analytics",
    body:
      "DigiTantra may use cookies, analytics tags, and similar technologies to understand traffic, page performance, and user journeys. These tools help us measure what is working and improve the experience, but they are not meant to expose unnecessary personal information.",
  },
  {
    title: "Data Sharing",
    body:
      "We may share data with infrastructure, analytics, communication, and support providers only when required to run DigiTantra effectively. We do not sell personal information to third parties. Any sharing is limited to legitimate business or legal requirements.",
  },
  {
    title: "Data Retention And Security",
    body:
      "We keep information only as long as needed for platform operations, legal obligations, dispute resolution, and service improvement. We use reasonable administrative and technical safeguards to protect stored information, though no internet-based system can guarantee absolute security.",
  },
  {
    title: "Your Rights",
    body:
      "You can contact DigiTantra to request access, correction, or deletion of your personal information, subject to operational or legal limits. If you no longer want us to retain certain information, reach out and we will review the request promptly.",
  },
  {
    title: "Contact",
    body:
      `For any privacy-related request, question, or complaint, email ${SUPPORT_EMAIL} or use the contact page and clearly mention that your request is related to privacy or personal data.`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="relative z-10">
      <section className="border-b border-white/5 bg-background/80">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Legal</p>
            <h1 className="mt-4 font-headline text-4xl md:text-6xl">Privacy Policy</h1>
            <p className="mt-6 max-w-3xl text-lg text-muted-foreground">
              This page explains what DigiTantra collects, why it is collected, and how that information is handled.
              If you use the app, contact the team, or subscribe to updates, this policy applies to that interaction.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">Last updated: April 6, 2026</p>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="grid gap-6">
            {policySections.map((section) => (
              <article
                key={section.title}
                className="glassmorphic rounded-2xl border border-white/10 p-6 md:p-8"
              >
                <h2 className="font-headline text-2xl">{section.title}</h2>
                <p className="mt-4 max-w-4xl text-sm leading-7 text-muted-foreground md:text-base">
                  {section.body}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-6 md:p-8">
            <h2 className="font-headline text-2xl">Need Help With A Privacy Request?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
              Send the request to{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-semibold text-primary transition-colors hover:text-primary/80"
              >
                {SUPPORT_EMAIL}
              </a>{" "}
              or use the contact page and include enough detail for us to identify your account or enquiry safely.
            </p>
            <div className="mt-5">
              <Link href="/contact" className="font-semibold text-primary transition-colors hover:text-primary/80">
                Contact DigiTantra
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
