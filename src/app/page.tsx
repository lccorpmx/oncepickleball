import { ActivitiesSection } from "@/components/site/activities-section";
import { BenefitsSection } from "@/components/site/benefits-section";
import { BookingSection } from "@/components/site/booking-section";
import { ClosingSection } from "@/components/site/closing-section";
import { CourtsSection } from "@/components/site/courts-section";
import { FaqSection } from "@/components/site/faq-section";
import { Hero } from "@/components/site/hero";
import { HowToPlaySection } from "@/components/site/how-to-play-section";
import { RevealObserver } from "@/components/site/reveal-observer";
import { ScheduleSection } from "@/components/site/schedule-section";
import { SiteHeader } from "@/components/site/site-header";
import { TournamentSection } from "@/components/site/tournament-section";
import { Stage } from "@/components/stage/stage";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <CourtsSection />
        <BenefitsSection />
        <ActivitiesSection />
        <HowToPlaySection />
        <TournamentSection />
        <ScheduleSection />
        <BookingSection />
        <FaqSection />
        <ClosingSection />
      </main>
      <Stage />
      <RevealObserver />
    </>
  );
}
