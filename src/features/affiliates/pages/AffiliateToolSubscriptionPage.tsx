import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, CreditCard, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useIsAffiliateUser } from '../hooks/useIsAffiliateUser';
import { affiliatesApi } from '../api/affiliatesApi';
import { affiliateKeys } from '../hooks/queryKeys';
import { AFFILIATE_PAGE_CLASS, AffiliatePageHeader, AffiliatePageLoading } from '../components/AffiliatePageLayout';

type Plano = 'mensal' | 'anual';
type BillingType = 'CREDIT_CARD' | 'PIX';

const PLANOS: Array<{ id: Plano; label: string; price: string; detail: string }> = [
  { id: 'mensal', label: 'Mensal', price: 'R$ 39,90/mês', detail: 'Cobrança recorrente mensal' },
  { id: 'anual', label: 'Anual', price: 'R$ 299,00/ano', detail: 'Melhor custo-benefício' },
];

const PAGE_CONTAINER = AFFILIATE_PAGE_CLASS;

export function AffiliateToolSubscriptionPage() {
  const queryClient = useQueryClient();
  const { isAffiliate, isLoading: loadingAffiliate } = useIsAffiliateUser();
  const [plano, setPlano] = useState<Plano>('mensal');
  const [billingType, setBillingType] = useState<BillingType>('CREDIT_CARD');
  const [error, setError] = useState('');
  const [pixData, setPixData] = useState<{ qr?: string; copy?: string; authId?: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [card, setCard] = useState({
    holderName: '',
    number: '',
    expiryMonth: '',
    expiryYear: '',
    ccv: '',
    postalCode: '',
    addressNumber: '',
    phone: '',
  });

  const [pixAddress, setPixAddress] = useState({
    postalCode: '',
    address: '',
    addressNumber: '',
    province: '',
  });

  const { data: toolStatus, isLoading: loadingStatus } = useQuery({
    queryKey: affiliateKeys.toolSubscription(),
    queryFn: affiliatesApi.getAffiliateToolSubscriptionStatus,
    enabled: isAffiliate,
  });

  const subscribeMutation = useMutation({
    mutationFn: affiliatesApi.subscribeAffiliateTool,
    onSuccess: (result) => {
      setError('');
      if (result.pix_qr_code_url || result.pix_copy_paste_code) {
        setPixData({
          qr: result.pix_qr_code_url,
          copy: result.pix_copy_paste_code,
          authId: result.pix_automatic_authorization_id,
        });
        setSuccessMessage(result.message || 'PIX gerado. Conclua o pagamento para liberar a ferramenta.');
      } else {
        setSuccessMessage(
          result.message ||
            'Assinatura enviada para processamento. Você continua como afiliado e ganha acesso à ferramenta após confirmação.'
        );
      }
      queryClient.invalidateQueries({ queryKey: affiliateKeys.toolSubscription() });
    },
    onError: (err: Error) => {
      setSuccessMessage('');
      setPixData(null);
      setError(err.message || 'Não foi possível concluir a assinatura.');
    },
  });

  const handleSubscribe = () => {
    setError('');
    setSuccessMessage('');
    setPixData(null);

    if (billingType === 'CREDIT_CARD') {
      subscribeMutation.mutate({
        plano,
        billing_type: 'CREDIT_CARD',
        credit_card: {
          holderName: card.holderName,
          number: card.number.replace(/\D/g, ''),
          expiryMonth: card.expiryMonth,
          expiryYear: card.expiryYear,
          ccv: card.ccv,
        },
        credit_card_holder_info: {
          name: card.holderName,
          email: '',
          cpfCnpj: '',
          postalCode: card.postalCode.replace(/\D/g, ''),
          addressNumber: card.addressNumber,
          phone: card.phone.replace(/\D/g, ''),
        },
      });
      return;
    }

    subscribeMutation.mutate({
      plano,
      billing_type: 'PIX',
      billing_address: {
        postalCode: pixAddress.postalCode.replace(/\D/g, ''),
        address: pixAddress.address,
        addressNumber: pixAddress.addressNumber,
        province: pixAddress.province,
      },
    });
  };

  if (loadingAffiliate || loadingStatus) {
    return <AffiliatePageLoading message="Carregando assinatura…" />;
  }

  if (!isAffiliate) {
    return (
      <div className={PAGE_CONTAINER}>
        <AffiliatePageHeader title="Assinar Disparo Rápido" />
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Programa de afiliados</AlertTitle>
          <AlertDescription>Sua conta não está vinculada a um cadastro de afiliado.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (toolStatus?.hasActiveAccess) {
    return (
      <div className={PAGE_CONTAINER}>
        <AffiliatePageHeader title="Assinar Disparo Rápido" />
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-700" />
          <AlertTitle className="text-green-900">Ferramenta ativa</AlertTitle>
          <AlertDescription className="text-green-800">
            Você já possui assinatura da extensão Disparo Rápido
            {toolStatus.plano ? ` (${toolStatus.plano})` : ''}. Seu perfil de afiliado permanece ativo.
            Gerencie pagamentos em <strong>Assinatura</strong> no menu lateral.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={PAGE_CONTAINER}>
      <AffiliatePageHeader title="Assinar Disparo Rápido" />

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Não use o checkout do site</AlertTitle>
        <AlertDescription>
          Se você assinar pelo site com o mesmo e-mail, o cadastro pode ser bloqueado ou tratado como cliente novo.
          Sempre use esta página estando logado no CRM.
        </AlertDescription>
      </Alert>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {successMessage ? (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-700" />
          <AlertTitle className="text-green-900">Pedido registrado</AlertTitle>
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {PLANOS.map((p) => (
          <Card
            key={p.id}
            className={`cursor-pointer transition-colors ${plano === p.id ? 'border-primary ring-2 ring-primary/20' : ''}`}
            onClick={() => setPlano(p.id)}
          >
            <CardHeader>
              <CardTitle>{p.label}</CardTitle>
              <CardDescription>{p.detail}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{p.price}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Forma de pagamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={billingType === 'CREDIT_CARD' ? 'default' : 'outline'}
              onClick={() => setBillingType('CREDIT_CARD')}
            >
              Cartão
            </Button>
            <Button
              type="button"
              variant={billingType === 'PIX' ? 'default' : 'outline'}
              onClick={() => setBillingType('PIX')}
            >
              PIX Automático
            </Button>
          </div>

          {billingType === 'CREDIT_CARD' ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="holderName">Nome no cartão</Label>
                <Input
                  id="holderName"
                  value={card.holderName}
                  onChange={(e) => setCard({ ...card, holderName: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="number">Número do cartão</Label>
                <Input
                  id="number"
                  value={card.number}
                  onChange={(e) => setCard({ ...card, number: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="expiryMonth">Mês</Label>
                <Input
                  id="expiryMonth"
                  placeholder="MM"
                  value={card.expiryMonth}
                  onChange={(e) => setCard({ ...card, expiryMonth: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="expiryYear">Ano</Label>
                <Input
                  id="expiryYear"
                  placeholder="AAAA"
                  value={card.expiryYear}
                  onChange={(e) => setCard({ ...card, expiryYear: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="ccv">CVV</Label>
                <Input id="ccv" value={card.ccv} onChange={(e) => setCard({ ...card, ccv: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" value={card.phone} onChange={(e) => setCard({ ...card, phone: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="postalCode">CEP</Label>
                <Input
                  id="postalCode"
                  value={card.postalCode}
                  onChange={(e) => setCard({ ...card, postalCode: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="addressNumber">Número</Label>
                <Input
                  id="addressNumber"
                  value={card.addressNumber}
                  onChange={(e) => setCard({ ...card, addressNumber: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="pixCep">CEP</Label>
                <Input
                  id="pixCep"
                  value={pixAddress.postalCode}
                  onChange={(e) => setPixAddress({ ...pixAddress, postalCode: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="pixNumber">Número</Label>
                <Input
                  id="pixNumber"
                  value={pixAddress.addressNumber}
                  onChange={(e) => setPixAddress({ ...pixAddress, addressNumber: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="pixAddress">Endereço</Label>
                <Input
                  id="pixAddress"
                  value={pixAddress.address}
                  onChange={(e) => setPixAddress({ ...pixAddress, address: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="pixProvince">Bairro</Label>
                <Input
                  id="pixProvince"
                  value={pixAddress.province}
                  onChange={(e) => setPixAddress({ ...pixAddress, province: e.target.value })}
                />
              </div>
            </div>
          )}

          {pixData?.qr ? (
            <div className="rounded-lg border p-4 space-y-3">
              <p className="text-sm font-medium">Escaneie o QR Code PIX</p>
              <img src={pixData.qr} alt="QR Code PIX" className="mx-auto max-w-[220px]" />
              {pixData.copy ? (
                <p className="text-xs break-all text-muted-foreground">{pixData.copy}</p>
              ) : null}
            </div>
          ) : null}

          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={subscribeMutation.isPending}
            onClick={handleSubscribe}
          >
            {subscribeMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              `Assinar plano ${plano}`
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
