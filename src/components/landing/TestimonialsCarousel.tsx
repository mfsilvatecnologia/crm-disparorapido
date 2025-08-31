import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

export function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      name: 'Ana Costa',
      role: 'Gerente de Vendas',
      company: 'MarketingPro',
      avatar: 'AC',
      quote: 'Conseguimos dobrar nossa carteira de clientes em 6 meses. O LeadsRapido transformou nossa prospecção.',
      rating: 5
    },
    {
      name: 'Roberto Lima',
      role: 'CEO',
      company: 'SoftwareHouse',
      avatar: 'RL',
      quote: 'A integração com nosso Pipedrive foi perfeita. Agora nossa equipe foca só no que importa: vender.',
      rating: 5
    },
    {
      name: 'Julia Santos',
      role: 'Diretora Comercial',
      company: 'ConsultoriaFin',
      avatar: 'JS',
      quote: 'R$ 2,50 por lead de qualidade? Impossível encontrar melhor custo-benefício no mercado.',
      rating: 5
    },
    {
      name: 'Fernando Oliveira',
      role: 'Coordenador de Vendas',
      company: 'TechStartup',
      avatar: 'FO',
      quote: 'Reduzimos o tempo de prospecção em 80%. Agora focamos no que realmente importa: fechar negócios.',
      rating: 5
    },
    {
      name: 'Mariana Souza',
      role: 'Head de Growth',
      company: 'ScaleUp',
      avatar: 'MS',
      quote: 'Os dados são sempre atualizados e precisos. Nossa taxa de conversão aumentou 250%.',
      rating: 5
    }
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(nextTestimonial, 5000);
    return () => clearInterval(interval);
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: rating }, (_, i) => (
      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
    ));
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            O que Nossos Clientes Dizem
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Mais de 500 empresas já transformaram sua prospecção com o LeadsRapido.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Main Testimonial */}
          <Card className="bg-background border shadow-lg">
            <CardContent className="p-8 md:p-12">
              <div className="text-center space-y-6">
                {/* Quote */}
                <blockquote className="text-xl md:text-2xl text-foreground leading-relaxed">
                  "{testimonials[currentIndex].quote}"
                </blockquote>

                {/* Rating */}
                <div className="flex justify-center space-x-1">
                  {renderStars(testimonials[currentIndex].rating)}
                </div>

                {/* Author */}
                <div className="flex items-center justify-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {testimonials[currentIndex].avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="font-semibold text-foreground text-lg">
                      {testimonials[currentIndex].name}
                    </p>
                    <p className="text-muted-foreground">
                      {testimonials[currentIndex].role} - {testimonials[currentIndex].company}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-center space-x-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={prevTestimonial}
              className="rounded-full"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextTestimonial}
              className="rounded-full"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Indicators */}
          <div className="flex justify-center space-x-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Side Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <Card key={index} className="bg-background border">
              <CardContent className="p-6 space-y-4">
                <div className="flex space-x-1">
                  {renderStars(testimonial.rating)}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground text-sm">{testimonial.name}</p>
                    <p className="text-muted-foreground text-xs">{testimonial.company}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}