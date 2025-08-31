import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, TrendingUp } from 'lucide-react';

// Mock data for Brazilian states
const mockRegionData = [
  { state: 'SP', name: 'São Paulo', leads: 3420, percentage: 28.5, growth: 12 },
  { state: 'RJ', name: 'Rio de Janeiro', leads: 1890, percentage: 15.7, growth: 8 },
  { state: 'MG', name: 'Minas Gerais', leads: 1456, percentage: 12.1, growth: 15 },
  { state: 'RS', name: 'Rio Grande do Sul', leads: 987, percentage: 8.2, growth: 6 },
  { state: 'PR', name: 'Paraná', leads: 834, percentage: 6.9, growth: 22 },
  { state: 'SC', name: 'Santa Catarina', leads: 712, percentage: 5.9, growth: 18 },
  { state: 'BA', name: 'Bahia', leads: 645, percentage: 5.4, growth: -3 },
  { state: 'DF', name: 'Distrito Federal', leads: 523, percentage: 4.3, growth: 25 },
  { state: 'GO', name: 'Goiás', leads: 445, percentage: 3.7, growth: 9 },
  { state: 'PE', name: 'Pernambuco', leads: 398, percentage: 3.3, growth: 11 },
];

export function RegionMap() {
  return (
    <Card className="bg-gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Distribuição por Estado
        </CardTitle>
        <CardDescription>
          Densidade de leads por região nos últimos 30 dias
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {mockRegionData.map((region, index) => (
            <div 
              key={region.state}
              className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                  {index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{region.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {region.state}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {region.leads.toLocaleString()} leads ({region.percentage}%)
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 text-sm ${
                  region.growth >= 0 ? 'text-success' : 'text-destructive'
                }`}>
                  <TrendingUp className={`h-3 w-3 ${
                    region.growth < 0 ? 'rotate-180' : ''
                  }`} />
                  <span>{Math.abs(region.growth)}%</span>
                </div>
                
                {/* Progress bar */}
                <div className="w-20 bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(region.percentage / 30) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground text-center">
            💡 Mapa interativo em desenvolvimento. Dados baseados em geolocalização dos leads.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}