import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
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
import { Switch } from '@/shared/components/ui/switch'
import { Badge } from '@/shared/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { X, Plus } from 'lucide-react'
import type { Campaign, CreateCampaignData, UpdateCampaignData } from '../types/campaigns'

const campaignSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  descricao: z.string().optional(),
  tipo: z.enum(['email', 'sms', 'whatsapp', 'linkedin', 'phone', 'mixed']),
  responsavelId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  dataInicio: z.string().optional(),

  configuracao: z.object({
    autoStart: z.boolean().default(false),
    allowManualTrigger: z.boolean().default(true),
    maxContacts: z.number().min(1, 'Mínimo 1 contato').max(10000, 'Máximo 10.000 contatos'),
    dailyLimit: z.number().optional(),
    timezone: z.string().default('America/Sao_Paulo'),
    workingHours: z.object({
      start: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
      end: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
      days: z.array(z.number().min(0).max(6)).min(1, 'Selecione ao menos um dia')
    }).optional()
  }),

  targeting: z.object({
    segmentoIds: z.array(z.string()).optional(),
    leadFilters: z.object({
      status: z.array(z.string()).optional(),
      origem: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
      scoreMinimo: z.number().optional(),
      scoreMaximo: z.number().optional(),
      dataInicio: z.string().optional(),
      dataFim: z.string().optional()
    }).optional(),
    companyFilters: z.object({
      tamanhoEmpresa: z.array(z.string()).optional(),
      segmento: z.array(z.string()).optional(),
      status: z.array(z.string()).optional(),
      localizacao: z.array(z.string()).optional()
    }).optional()
  })
})

type CampaignFormData = z.infer<typeof campaignSchema>

interface CampaignFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateCampaignData | UpdateCampaignData) => Promise<void>
  campaign?: Campaign
  loading?: boolean
}

const weekDays = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' }
]

export function CampaignForm({ open, onClose, onSubmit, campaign, loading }: CampaignFormProps) {
  const [newTag, setNewTag] = useState('')
  const isEditing = !!campaign

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: campaign ? {
      nome: campaign.nome,
      descricao: campaign.descricao || '',
      tipo: campaign.tipo,
      responsavelId: campaign.responsavelId || '',
      tags: campaign.tags || [],
      dataInicio: campaign.dataInicio || '',
      configuracao: campaign.configuracao,
      targeting: campaign.targeting
    } : {
      nome: '',
      descricao: '',
      tipo: 'email',
      tags: [],
      configuracao: {
        autoStart: false,
        allowManualTrigger: true,
        maxContacts: 1000,
        timezone: 'America/Sao_Paulo',
        workingHours: {
          start: '09:00',
          end: '18:00',
          days: [1, 2, 3, 4, 5] // Segunda a sexta
        }
      },
      targeting: {}
    }
  })

  const handleSubmit = async (data: CampaignFormData) => {
    try {
      if (isEditing) {
        await onSubmit({ ...data, id: campaign.id } as UpdateCampaignData)
      } else {
        // Adicionar sequência padrão para novas campanhas
        const campaignData: CreateCampaignData = {
          ...data,
          sequencia: [] // Será definida em outra etapa
        }
        await onSubmit(campaignData)
      }
      onClose()
    } catch (error) {
      console.error('Error submitting campaign:', error)
    }
  }

  const addTag = () => {
    if (newTag.trim()) {
      const currentTags = form.getValues('tags')
      if (!currentTags.includes(newTag.trim())) {
        form.setValue('tags', [...currentTags, newTag.trim()])
      }
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags')
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove))
  }

  const toggleWorkingDay = (day: number) => {
    const workingHours = form.getValues('configuracao.workingHours')
    if (!workingHours) return

    const currentDays = workingHours.days || []
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort()

    form.setValue('configuracao.workingHours.days', newDays)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Campanha' : 'Nova Campanha'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize as informações da campanha'
              : 'Configure uma nova campanha de marketing automation'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="config">Configuração</TabsTrigger>
                <TabsTrigger value="targeting">Segmentação</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Campanha</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Email Sequência Leads 2024" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo da Campanha</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="sms">SMS</SelectItem>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            <SelectItem value="linkedin">LinkedIn</SelectItem>
                            <SelectItem value="phone">Telefone</SelectItem>
                            <SelectItem value="mixed">Mista</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva os objetivos e características desta campanha..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tags */}
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Nova tag"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          />
                          <Button type="button" onClick={addTag} size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {field.value.map((tag) => (
                            <Badge key={tag} variant="secondary" className="gap-1">
                              {tag}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => removeTag(tag)}
                              />
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="config" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações de Execução</CardTitle>
                    <CardDescription>
                      Configure como e quando a campanha será executada
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="configuracao.maxContacts"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Máximo de Contatos</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="10000"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="configuracao.dailyLimit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Limite Diário</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                placeholder="Opcional"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormDescription>
                              Limite de contatos processados por dia
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <FormField
                        control={form.control}
                        name="configuracao.autoStart"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Início Automático</FormLabel>
                              <FormDescription>
                                Iniciar campanha automaticamente na data programada
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Horário de Funcionamento</CardTitle>
                    <CardDescription>
                      Configure os horários em que a campanha pode ser executada
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="configuracao.workingHours.start"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Horário de Início</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="configuracao.workingHours.end"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Horário de Fim</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="configuracao.workingHours.days"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dias da Semana</FormLabel>
                          <FormControl>
                            <div className="flex gap-1">
                              {weekDays.map((day) => (
                                <Button
                                  key={day.value}
                                  type="button"
                                  variant={field.value?.includes(day.value) ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => toggleWorkingDay(day.value)}
                                >
                                  {day.label}
                                </Button>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="targeting" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Segmentação de Leads</CardTitle>
                    <CardDescription>
                      Configure os filtros para segmentar os leads que receberão a campanha
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="targeting.leadFilters.scoreMinimo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Score Mínimo</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                placeholder="0-100"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="targeting.leadFilters.scoreMaximo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Score Máximo</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                placeholder="0-100"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="targeting.leadFilters.dataInicio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Início</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormDescription>
                              Leads criados a partir desta data
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="targeting.leadFilters.dataFim"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Fim</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormDescription>
                              Leads criados até esta data
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar Campanha'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}