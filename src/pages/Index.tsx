import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Verifica se estamos recebendo um redirecionamento do Supabase para reset de senha
    // Pode vir tanto na query string (?token=...) quanto no hash (#access_token=...)
    let token = null;
    let type = null;

    // Verifica query parameters
    const urlParams = new URLSearchParams(location.search);
    token = urlParams.get('token');
    type = urlParams.get('type');

    // Se não encontrou nos query params, verifica no hash (formato do Supabase)
    if (!token && location.hash) {
      const hashParams = new URLSearchParams(location.hash.substring(1));
      token = hashParams.get('access_token');
      type = hashParams.get('type');
    }

    if (token && type === 'recovery') {
      // Redireciona para a página de nova senha com o token
      navigate(`/nova-senha?token=${token}&type=${type}`);
    }
  }, [location.search, location.hash, navigate]);

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