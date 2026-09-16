import { Survey } from "@/components/survey/Survey";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WhyUseSolarSelector } from "@/components/WhyUseSolarSelector";

export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#eligibility-check">
        Skip to eligibility check
      </a>
      <SiteHeader />
      <main>
        <Survey />
        <WhyUseSolarSelector />
      </main>
      <SiteFooter />
    </>
  );
}
