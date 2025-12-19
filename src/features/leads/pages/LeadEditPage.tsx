import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Badge } from '@/shared/components/ui/badge'
import { toast } from '@/shared/components/ui/use-toast'
import { ApiError } from '@/shared/services/client'
import { useLead, useUpdateLead } from '../hooks/useLeads'
import type { UpdateLeadDTO } from '@/shared/services/schemas'

const optionalTrimmedString = () =>
  z.preprocess((value) => {
    if (typeof value !== 'string') return value
    const trimmed = value.trim()
    return trimmed === '' ? undefined : trimmed
  }, z.string().optional())

const requiredEmail = () =>
  z.preprocess((value) => {
    if (typeof value !== 'string') return value
    return value.trim()
  }, z.string().min(1, 'Email é obrigatório').email('Email inválido'))

const optionalUrl = () =>
  z.preprocess((value) => {
    if (typeof value !== 'string') return value
    const trimmed = value.trim()
    return trimmed === '' ? undefined : trimmed
  }, z.string().url('URL inválida').optional())

const optionalNumber = () =>
  z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) return undefined
    const parsed = Number(value)
    return Number.isNaN(parsed) ? value : parsed
  }, z.number().optional())

const optionalInt = () =>
  z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) return undefined
    const parsed = Number(value)
    return Number.isNaN(parsed) ? value : parsed
  }, z.number().int().nonnegative().optional())

const leadEditSchema = z.object({
  nomeEmpresa: z.string().min(2, 'Nome da empresa é obrigatório'),
  nomeContato: optionalTrimmedString(),
  cargoContato: optionalTrimmedString(),
  email: requiredEmail(),
  telefone: optionalTrimmedString(),
  linkedinUrl: optionalUrl(),
  siteEmpresa: optionalUrl(),
  cnpj: optionalTrimmedString(),
  segmento: optionalTrimmedString(),
  porteEmpresa: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.enum(['MEI', 'Micro', 'Pequena', 'Média', 'Grande']).optional()
  ),
  numFuncionarios: optionalInt(),
  receitaAnualEstimada: optionalNumber(),
  endereco: z.object({
    rua: optionalTrimmedString(),
    numero: optionalTrimmedString(),
    cidade: optionalTrimmedString(),
    estado: optionalTrimmedString(),
    cep: optionalTrimmedString(),
    pais: optionalTrimmedString(),
    latitude: optionalNumber(),
    longitude: optionalNumber(),
  }),
  tags: z.array(z.string()).default([]),
  observacoes: optionalTrimmedString(),
  fonte: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.enum(['MANUAL', 'WEBSITE', 'LINKEDIN', 'INDICACAO', 'EVENTO', 'OUTROS']).optional()
  ),
  dadosOriginais: z.string().optional(),
  custoAquisicao: optionalNumber(),
})

type LeadEditFormValues = z.infer<typeof leadEditSchema>

const fonteOptions = [
  { value: 'MANUAL', label: 'Manual' },
  { value: 'WEBSITE', label: 'Website' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'INDICACAO', label: 'Indicação' },
  { value: 'EVENTO', label: 'Evento' },
  { value: 'OUTROS', label: 'Outros' },
]

const porteOptions = [
  { value: 'MEI', label: 'MEI' },
  { value: 'Micro', label: 'Micro' },
  { value: 'Pequena', label: 'Pequena' },
  { value: 'Média', label: 'Média' },
  { value: 'Grande', label: 'Grande' },
]

export default function LeadEditPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const leadId = id || ''
  const { data: lead, isLoading, error } = useLead(leadId)
  const { mutateAsync: updateLead, isPending } = useUpdateLead()
  const [newTag, setNewTag] = React.useState('')

  const form = useForm<LeadEditFormValues>({
    resolver: zodResolver(leadEditSchema),
    defaultValues: {
      nomeEmpresa: '',
      nomeContato: '',
      cargoContato: '',
      email: '',
      telefone: '',
      linkedinUrl: '',
      siteEmpresa: '',
      cnpj: '',
      segmento: '',
      porteEmpresa: undefined,
      numFuncionarios: undefined,
      receitaAnualEstimada: undefined,
      endereco: {
        rua: '',
        numero: '',
        cidade: '',
        estado: '',
        cep: '',
        pais: '',
        latitude: undefined,
        longitude: undefined,
      },
      tags: [],
      observacoes: '',
      fonte: undefined,
      dadosOriginais: '',
      custoAquisicao: undefined,
    },
  })

  React.useEffect(() => {
    if (!lead) return
    form.reset({
      nomeEmpresa: lead.nomeEmpresa || '',
      nomeContato: lead.nomeContato || '',
      cargoContato: lead.cargoContato || '',
      email: lead.email || '',
      telefone: lead.telefone || '',
      linkedinUrl: lead.linkedinUrl || '',
      siteEmpresa: lead.siteEmpresa || '',
      cnpj: lead.cnpj || '',
      segmento: lead.segmento || '',
      porteEmpresa: lead.porteEmpresa && porteOptions.some((opt) => opt.value === lead.porteEmpresa)
        ? lead.porteEmpresa
        : undefined,
      numFuncionarios: lead.numFuncionarios ?? undefined,
      receitaAnualEstimada: lead.receitaAnualEstimada ?? undefined,
      endereco: {
        rua: lead.endereco?.rua || '',
        numero: lead.endereco?.numero || '',
        cidade: lead.endereco?.cidade || '',
        estado: lead.endereco?.estado || '',
        cep: lead.endereco?.cep || '',
        pais: lead.endereco?.pais || '',
        latitude: lead.endereco?.latitude ?? undefined,
        longitude: lead.endereco?.longitude ?? undefined,
      },
      tags: lead.tags || [],
      observacoes: lead.observacoes || '',
      fonte: lead.fonte && fonteOptions.some((opt) => opt.value === lead.fonte)
        ? lead.fonte
        : undefined,
      dadosOriginais: lead.dadosOriginais
        ? JSON.stringify(lead.dadosOriginais, null, 2)
        : '',
      custoAquisicao: lead.custoAquisicao ?? undefined,
    })
  }, [lead, form])

  const watchedTags = form.watch('tags')

  const handleAddTag = () => {
    const nextTag = newTag.trim()
    if (!nextTag || watchedTags.includes(nextTag)) {
      return
    }
    form.setValue('tags', [...watchedTags, nextTag], { shouldValidate: true })
    setNewTag('')
  }

  const handleRemoveTag = (tagToRemove: string) => {
    form.setValue('tags', watchedTags.filter((tag) => tag !== tagToRemove), { shouldValidate: true })
  }

  const handleTagKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleAddTag()
    }
  }

  const normalizeOptional = (value?: string) => {
    const trimmed = value?.trim()
    return trimmed ? trimmed : undefined
  }

  const handleOptionalNumberChange = (
    field: { onChange: (value: number | undefined) => void }
  ) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    field.onChange(value === '' ? undefined : Number(value))
  }

  const handleSubmit = async (values: LeadCreateFormValues) => {
    const originalData = values.dadosOriginais?.trim()
    let parsedOriginalData: Record<string, unknown> | undefined

    if (originalData) {
      try {
        parsedOriginalData = JSON.parse(originalData) as Record<string, unknown>
      } catch (error) {
        form.setError('dadosOriginais', {
          type: 'manual',
          message: 'JSON inválido. Verifique a estrutura.',
        })
        return
      }
    }

    const endereco = {
      rua: normalizeOptional(values.endereco.rua),
      numero: normalizeOptional(values.endereco.numero),
      cidade: normalizeOptional(values.endereco.cidade),
      estado: normalizeOptional(values.endereco.estado),
      cep: normalizeOptional(values.endereco.cep),
      pais: normalizeOptional(values.endereco.pais),
      latitude: values.endereco.latitude,
      longitude: values.endereco.longitude,
    }

    const hasEndereco =
      Object.values(endereco).some((value) => value !== undefined && value !== '')

    const payload: UpdateLeadDTO & { nomeEmpresa?: string } = {
      nomeEmpresa: values.nomeEmpresa.trim(),
      nomeContato: normalizeOptional(values.nomeContato),
      cargoContato: normalizeOptional(values.cargoContato),
      email: values.email.trim(),
      telefone: normalizeOptional(values.telefone),
      linkedinUrl: normalizeOptional(values.linkedinUrl),
      siteEmpresa: normalizeOptional(values.siteEmpresa),
      cnpj: normalizeOptional(values.cnpj),
      segmento: normalizeOptional(values.segmento),
      porteEmpresa: values.porteEmpresa || undefined,
      numFuncionarios: values.numFuncionarios,
      receitaAnualEstimada: values.receitaAnualEstimada,
      endereco: hasEndereco ? endereco : undefined,
      tags: values.tags.length > 0 ? values.tags : undefined,
      observacoes: normalizeOptional(values.observacoes),
      fonte: values.fonte || undefined,
      dadosOriginais: parsedOriginalData,
      custoAquisicao: values.custoAquisicao,
    }

    const applyApiErrors = (apiError: ApiError) => {
      if (!apiError.data || typeof apiError.data !== 'object') return
      const data = apiError.data as {
        error?: string
        details?: Record<string, string[] | string>
        context?: { missingFields?: string[] }
      }

      if (data.details && typeof data.details === 'object') {
        Object.entries(data.details).forEach(([field, message]) => {
          const msg = Array.isArray(message) ? message[0] : message
          if (msg) {
            form.setError(field as keyof LeadCreateFormValues, {
              type: 'server',
              message: msg,
            })
          }
        })
      }

      if (data.context?.missingFields?.length) {
        data.context.missingFields.forEach((field) => {
          form.setError(field as keyof LeadCreateFormValues, {
            type: 'server',
            message: 'Campo obrigatório',
          })
        })
      }

      if (data.error && data.error.includes(':')) {
        const parts = data.error.split(':')
        const fieldsList = parts.slice(1).join(':')
        const fields = fieldsList
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
        fields.forEach((field) => {
          form.setError(field as keyof LeadCreateFormValues, {
            type: 'server',
            message: 'Campo obrigatório',
          })
        })
      }
    }

    try {
      await updateLead({ id: leadId, data: payload as UpdateLeadDTO })
      toast({
        title: 'Lead atualizado',
        description: 'As informações foram salvas com sucesso.',
      })
      navigate('/app/leads')
    } catch (error) {
      if (error instanceof ApiError) {
        applyApiErrors(error)
      }
      toast({
        title: 'Falha ao atualizar lead',
        description: error instanceof Error ? error.message : 'Erro inesperado ao salvar lead.',
        variant: 'destructive',
      })
    }
  }

  if (!leadId) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Card className="mx-auto max-w-xl border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Lead não encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">ID do lead não informado.</p>
            <Button className="mt-4" onClick={() => navigate('/app/leads')}>
              Voltar para Leads
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Carregando lead...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Card className="mx-auto max-w-xl border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Erro ao carregar lead</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              {error instanceof Error ? error.message : 'Não foi possível carregar o lead.'}
            </p>
            <Button onClick={() => navigate('/app/leads')}>Voltar para Leads</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Lead</h1>
            <p className="text-gray-600">
              Atualize as informações do lead selecionado.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/app/leads')}>
            Voltar para Leads
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle>Empresa</CardTitle>
                <CardDescription>Informações principais da empresa.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="nomeEmpresa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da empresa *</FormLabel>
                      <FormControl>
                        <Input placeholder="Empresa Exemplo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <Input placeholder="00.000.000/0000-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="segmento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Segmento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex.: Tecnologia, Saúde..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="porteEmpresa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Porte</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o porte" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {porteOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numFuncionarios"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nº de funcionários</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Ex.: 120"
                          value={field.value ?? ''}
                          onChange={handleOptionalNumberChange(field)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="receitaAnualEstimada"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Receita anual estimada (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Ex.: 2500000"
                          value={field.value ?? ''}
                          onChange={handleOptionalNumberChange(field)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle>Contato</CardTitle>
                <CardDescription>Dados da pessoa de contato principal.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="nomeContato"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do contato</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do contato" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cargoContato"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo do contato</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex.: Diretor Comercial" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@empresa.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(11) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="linkedinUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn</FormLabel>
                      <FormControl>
                        <Input placeholder="https://linkedin.com/in/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="siteEmpresa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site da empresa</FormLabel>
                      <FormControl>
                        <Input placeholder="https://empresa.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle>Endereço</CardTitle>
                <CardDescription>Localização e coordenadas, se disponíveis.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="endereco.rua"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rua</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua das Flores" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endereco.numero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input placeholder="123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endereco.cidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="São Paulo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endereco.estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Input placeholder="SP" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endereco.cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input placeholder="00000-000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endereco.pais"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>País</FormLabel>
                      <FormControl>
                        <Input placeholder="Brasil" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endereco.latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="-23.5505"
                          value={field.value ?? ''}
                          onChange={handleOptionalNumberChange(field)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endereco.longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="-46.6333"
                          value={field.value ?? ''}
                          onChange={handleOptionalNumberChange(field)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle>Origem e classificação</CardTitle>
                <CardDescription>Dados de origem, custos e tags.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                  name="fonte"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fonte</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a fonte" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {fonteOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="custoAquisicao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custo de aquisição (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Ex.: 150"
                            value={field.value ?? ''}
                            onChange={handleOptionalNumberChange(field)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <FormLabel>Tags</FormLabel>
                  <div className="flex flex-col gap-2 md:flex-row">
                    <Input
                      placeholder="Adicionar tag"
                      value={newTag}
                      onChange={(event) => setNewTag(event.target.value)}
                      onKeyPress={handleTagKeyPress}
                    />
                    <Button type="button" variant="outline" onClick={handleAddTag}>
                      Adicionar
                    </Button>
                  </div>
                  {watchedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {watchedTags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => handleRemoveTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle>Observações e dados extras</CardTitle>
                <CardDescription>Notas internas e dados originais em JSON.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="observacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Observações sobre o lead..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dadosOriginais"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dados originais (JSON)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Ex.: {"campo": "valor"}'
                          className="min-h-[120px] font-mono text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Preencha apenas se tiver dados brutos a preservar (JSON válido).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
              <p className="text-sm text-gray-500">
                Campos obrigatórios marcados com *.
              </p>
              <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
                <Button type="button" variant="outline" onClick={() => navigate('/app/leads')}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-primary-600 hover:bg-primary-700" disabled={isPending}>
                  {isPending ? 'Salvando...' : 'Salvar alterações'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
