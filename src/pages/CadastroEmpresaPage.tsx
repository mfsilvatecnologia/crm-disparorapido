
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

export default function CadastroEmpresaPage() {
  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [segmento, setSegmento] = useState('');
  const [volumeAuditoriasMensal, setVolumeAuditoriasMensal] = useState('');
  const [recursosInteresse, setRecursosInteresse] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cep, setCep] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const empresaData = {
      nome,
      cnpj,
      email,
      segmento,
      volume_auditorias_mensal: volumeAuditoriasMensal,
      recursos_interesse: recursosInteresse.split(',').map(item => item.trim()),
      rua,
      numero,
      bairro,
      cidade,
      estado,
      cep,
    };

    try {
      await apiClient.createEmpresa(empresaData); 

      toast({
        title: "Empresa cadastrada com sucesso!",
        description: "A empresa ${nome} foi adicionada.",
      });

      // Clear form
      setNome('');
      setCnpj('');
      setEmail('');
      setSegmento('');
      setVolumeAuditoriasMensal('');
      setRecursosInteresse('');
      setRua('');
      setNumero('');
      setBairro('');
      setCidade('');
      setEstado('');
      setCep('');

    } catch (error) {
      console.error("Erro ao cadastrar empresa:", error);
      toast({
        title: "Erro ao cadastrar empresa",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Cadastrar Nova Empresa</CardTitle>
          <CardDescription>Preencha os dados para registrar uma nova empresa no sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Empresa</Label>
                <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Tech Solutions Ltda" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input id="cnpj" value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="12.345.678/0001-90" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email de Contato</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contato@techsolutions.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="segmento">Segmento</Label>
                <Input id="segmento" value={segmento} onChange={(e) => setSegmento(e.target.value)} placeholder="Tecnologia da Informação" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="volume_auditorias_mensal">Volume de Auditorias Mensal</Label>
                <Select value={volumeAuditoriasMensal} onValueChange={setVolumeAuditoriasMensal}>
                  <SelectTrigger id="volume_auditorias_mensal">
                    <SelectValue placeholder="Selecione o volume" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-50">1-50</SelectItem>
                    <SelectItem value="51-200">51-200</SelectItem>
                    <SelectItem value="201-500">201-500</SelectItem>
                    <SelectItem value="501+">501+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="recursos_interesse">Recursos de Interesse (separados por vírgula)</Label>
                <Input id="recursos_interesse" value={recursosInteresse} onChange={(e) => setRecursosInteresse(e.target.value)} placeholder="api, dashboard, relatórios" />
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
                <h3 className="text-lg font-medium">Endereço</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input id="cep" value={cep} onChange={(e) => setCep(e.target.value)} placeholder="01234-567" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="rua">Rua</Label>
                <Input id="rua" value={rua} onChange={(e) => setRua(e.target.value)} placeholder="Rua das Flores" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero">Número</Label>
                <Input id="numero" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="123" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input id="bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Centro" />
              </div>
                <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input id="cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="São Paulo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Input id="estado" value={estado} onChange={(e) => setEstado(e.target.value)} placeholder="SP" />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Salvar Empresa'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}