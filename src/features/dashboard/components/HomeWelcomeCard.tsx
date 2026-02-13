import React from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { useTenant } from '@/shared/contexts/TenantContext';

const SUPORTE_PHONE = '(16) 99293-3505';

export function HomeWelcomeCard() {
  const { tenant } = useTenant();

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="w-full border-0 shadow-none">
        <CardContent className="pt-6 pb-8">
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
