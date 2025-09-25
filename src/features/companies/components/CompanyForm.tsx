// CompanyForm Component - Create/edit company form
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Badge } from '@/shared/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { X } from 'lucide-react'
import type { Company, CreateCompanyData, UpdateCompanyData } from '../types/companies'

const enderecoSchema = z.object({
  rua: z.string().min(1, 'Rua é obrigatória'),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().min(2, 'Estado deve ter pelo menos 2 caracteres'),
  cep: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  pais: z.string().default('Brasil'),
}).optional()

const companyFormSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cnpj: z.string().optional(),
  email: z.string().email('Email inválido'),
  telefone: z.string().optional(),
  website: z.string().url('Website inválido').optional().or(z.literal('')),
  endereco: enderecoSchema,
  segmento: z.string().optional(),
  tamanhoEmpresa: z.enum(['startup', 'pequena', 'media', 'grande', 'enterprise']),
  status: z.enum(['ativa', 'inativa', 'prospecto', 'cliente', 'ex_cliente']).optional(),
  descricao: z.string().optional(),
  numeroFuncionarios: z.number().min(0).optional(),
  faturamentoAnual: z.number().min(0).optional(),
  linkedinUrl: z.string().url('LinkedIn URL inválida').optional().or(z.literal('')),
  tags: z.array(z.string()).default([]),
})

type CompanyFormData = z.infer<typeof companyFormSchema>

interface CompanyFormProps {
  company?: Company // Para edição
  onSubmit: (data: CreateCompanyData | UpdateCompanyData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function CompanyForm({ company, onSubmit, onCancel, isLoading }: CompanyFormProps) {
  const [newTag, setNewTag] = React.useState('')

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      nome: company?.nome || '',
      cnpj: company?.cnpj || '',
      email: company?.email || '',
      telefone: company?.telefone || '',
      website: company?.website || '',
      endereco: company?.endereco || undefined,
      segmento: company?.segmento || '',
      tamanhoEmpresa: company?.tamanhoEmpresa || 'pequena',
      status: company?.status || 'prospecto',
      descricao: company?.descricao || '',
      numeroFuncionarios: company?.numeroFuncionarios || undefined,
      faturamentoAnual: company?.faturamentoAnual || undefined,
      linkedinUrl: company?.linkedinUrl || '',
      tags: company?.tags || [],
    },
  })

  const watchedTags = form.watch('tags')

  const handleAddTag = () => {
    if (newTag.trim() && !watchedTags.includes(newTag.trim())) {
      form.setValue('tags', [...watchedTags, newTag.trim()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    form.setValue('tags', watchedTags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const onFormSubmit = async (data: CompanyFormData) => {
    try {
      // Clean up empty strings and optional fields
      const cleanData = {
        ...data,
        website: data.website || undefined,
        linkedinUrl: data.linkedinUrl || undefined,
        cnpj: data.cnpj || undefined,
        telefone: data.telefone || undefined,
        segmento: data.segmento || undefined,
        descricao: data.descricao || undefined,
      }

      if (company) {
        // Atualização
        const updateData: UpdateCompanyData = {
          id: company.id,
          ...cleanData,
        }
        await onSubmit(updateData)
      } else {
        // Criação
        const createData: CreateCompanyData = cleanData
        await onSubmit(createData)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">
          {company ? 'Editar Empresa' : 'Nova Empresa'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {company ? 'Atualize as informações da empresa' : 'Adicione uma nova empresa ao sistema'}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
              <TabsTrigger value="address">Endereço</TabsTrigger>
              <TabsTrigger value="details">Detalhes</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Empresa *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da empresa" {...field} />
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
                        <Input placeholder="00.000.000/0001-00" {...field} />
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
                        <Input type="email" placeholder="contato@empresa.com" {...field} />
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
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.empresa.com" {...field} />
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
                        <Input placeholder="https://linkedin.com/company/empresa" {...field} />
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
                        <Input placeholder="Tecnologia, Varejo, Saúde..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tamanhoEmpresa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tamanho da Empresa *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tamanho" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="startup">Startup (1-10 funcionários)</SelectItem>
                          <SelectItem value="pequena">Pequena (11-50 funcionários)</SelectItem>
                          <SelectItem value="media">Média (51-200 funcionários)</SelectItem>
                          <SelectItem value="grande">Grande (201-1000 funcionários)</SelectItem>
                          <SelectItem value="enterprise">Enterprise (1000+ funcionários)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Status (apenas para edição) */}
              {company && (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="prospecto">Prospecto</SelectItem>
                          <SelectItem value="ativa">Ativa</SelectItem>
                          <SelectItem value="cliente">Cliente</SelectItem>
                          <SelectItem value="ex_cliente">Ex-cliente</SelectItem>
                          <SelectItem value="inativa">Inativa</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </TabsContent>

            <TabsContent value="address" className="space-y-4">
              {/* Endereço */}
              <div className="space-y-4">
                <h3 className="font-medium">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="endereco.rua"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rua</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome da rua" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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
                    name="endereco.complemento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complemento</FormLabel>
                        <FormControl>
                          <Input placeholder="Sala 101" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endereco.bairro"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do bairro" {...field} />
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
                    name="endereco.cidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome da cidade" {...field} />
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
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              {/* Detalhes adicionais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="numeroFuncionarios"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Funcionários</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Ex: 50"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="faturamentoAnual"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Faturamento Anual (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Ex: 1000000"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <FormLabel>Tags</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="Adicionar tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <Button type="button" variant="outline" onClick={handleAddTag}>
                    Adicionar
                  </Button>
                </div>
                {watchedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {watchedTags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
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

              {/* Descrição */}
              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descrição sobre a empresa..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : (company ? 'Atualizar' : 'Criar Empresa')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}