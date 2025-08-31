import React from 'react';
import { HeroSection } from '../components/landing/HeroSection';
import { SocialProof } from '../components/landing/SocialProof';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { HowItWorks } from '../components/landing/HowItWorks';
import { PricingSection } from '../components/landing/PricingSection';
import { ROICalculator } from '../components/landing/ROICalculator';
// import { TestimonialsCarousel } from '../components/landing/TestimonialsCarousel';
import { FAQSection } from '../components/landing/FAQSection';
import { FinalCTA } from '../components/landing/FinalCTA';
import { LandingFooter } from '../components/landing/LandingFooter';

export function Index() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <SocialProof />
      <FeaturesSection />
      <HowItWorks />
      <PricingSection />
      <ROICalculator />
      {/* <TestimonialsCarousel /> */}
      <FAQSection />
      <FinalCTA />
      <LandingFooter />
    </div>
  );
}