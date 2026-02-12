import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useTenant } from '@/shared/contexts/TenantContext';

const SUPORTE_PHONE = '(16) 99293-3505';

export function HomeWelcomeCard() {
  const { tenant } = useTenant();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-2xl shadow-2xl border-0">
        <CardHeader className="text-center space-y-4 pt-8">
          <div className="flex justify-center">
            <img
              src={tenant.branding.logoLight || tenant.branding.logo}
              alt={tenant.branding.companyName}
              className="h-16 w-auto"
            />
          </div>
          <div>
            <CardTitle className="text-3xl md:text-4xl font-bold">
              Bem-vindo ao Disparo Rápido!
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pb-8">
          {/* Contato e Suporte */}
          <div className="text-center text-sm text-gray-600 bg-gray-50 rounded-lg p-4 space-y-2">
            {tenant.branding.supportEmail && (
              <p>
                Contato:{' '}
                <a
                  href={`mailto:${tenant.branding.supportEmail}`}
                  className="text-primary font-semibold hover:underline"
                >
                  {tenant.branding.supportEmail}
                </a>
              </p>
            )}
            <p>
              Suporte:{' '}
              <a
                href={`tel:+5516992933505`}
                className="text-primary font-semibold hover:underline"
              >
                {SUPORTE_PHONE}
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
