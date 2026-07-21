import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  Bot,
  Download,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Headphones,
  HelpCircle,
  MessageCircle,
  Play,
  PlayCircle,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/shared/components/ui/carousel';
import { cn } from '@/shared/utils/utils';
import '../styles/paginate-arrow.css';

type VideoTutorial = {
  title: string;
  description: string;
  url: string;
  thumbnail: string;
};

type Manual = {
  url: string;
  title: string;
  description: string;
  icon: typeof FileText;
  iconClassName: string;
  downloadLabel: string;
};

type Faq = {
  question: string;
  answer: ReactNode;
};

const VIDEOS: VideoTutorial[] = [
  {
    title: 'Nova Versão Disparo Rápido | Tutorial Completo',
    description: 'Conheça a nova versão da plataforma e veja o passo a passo completo de uso.',
    url: 'https://www.youtube.com/watch?v=IoOQJQkz1Jk',
    thumbnail: '/como-funciona.jpeg',
  },
  {
    title: 'Instalando a Disparo Rápido | Envio em Massa de WhatsApp',
    description: 'Aprenda a instalar e configurar a Disparo Rápido para começar a enviar.',
    url: 'https://www.youtube.com/watch?v=O10C94y1efc',
    thumbnail: '/install.jpeg',
  },
  {
    title: 'Importando sua Lista de Contatos | Disparo Rápido',
    description: 'Veja como importar sua lista de contatos corretamente para as campanhas.',
    url: 'https://www.youtube.com/watch?v=O_UjewlbDi4',
    thumbnail: '/lista-contatos.jpeg',
  },
  {
    title: 'Editando suas Mensagens na Disparo Rápido | Envio em Massa de WhatsApp',
    description: 'Aprenda a criar e editar mensagens para envio em massa no WhatsApp.',
    url: 'https://www.youtube.com/watch?v=RYC9tSVwC_M',
    thumbnail: '/mensagem.jpeg',
  },
  {
    title: 'Evite Bloqueios do WhatsApp | Intervalo de Tempo entre envios',
    description: 'Configure intervalos entre envios e reduza o risco de bloqueio no WhatsApp.',
    url: 'https://www.youtube.com/watch?v=zBjEWrF2CRo',
    thumbnail: '/entre-envios.jpeg',
  },
];

const MANUALS: Manual[] = [
  {
    url: '/manual_de_uso_disparo_rapido.pdf',
    title: 'Manual de uso Disparo Rápido',
    description: 'Guia completo da plataforma',
    icon: FileText,
    iconClassName: 'bg-emerald-100 text-emerald-600',
    downloadLabel: 'Baixar PDF',
  },
  {
    url: '/agentes-ia-disparo-rapido.pdf',
    title: 'Agentes IA Disparo Rápido',
    description: 'Como configurar e usar os agentes IA',
    icon: Bot,
    iconClassName: 'bg-teal-100 text-teal-600',
    downloadLabel: 'Baixar PDF',
  },
  {
    url: '/guia-pratico-para-vendas-no-whatsapp.pdf',
    title: 'Guia prático para vendas no WhatsApp',
    description: 'Estratégias e scripts para vender mais',
    icon: MessageCircle,
    iconClassName: 'bg-green-100 text-green-600',
    downloadLabel: 'Baixar PDF',
  },
  {
    url: '/manual-antibanimento.pdf',
    title: 'Manual antibanimento',
    description: 'Boas práticas para evitar bloqueios',
    icon: ShieldCheck,
    iconClassName: 'bg-emerald-100 text-emerald-600',
    downloadLabel: 'Baixar PDF',
  },
  {
    url: '/Modelo.csv',
    title: 'Modelo de contatos (CSV)',
    description: 'Planilha modelo para importar sua lista',
    icon: FileSpreadsheet,
    iconClassName: 'bg-blue-100 text-blue-600',
    downloadLabel: 'Baixar CSV',
  },
];

const FAQS: Faq[] = [
  {
    question: 'O que é a tecnologia AntiBlock Smart? Como ela funciona?',
    answer: (
      <div className="space-y-3">
        <p>
          O AntiBlock Smart é uma tecnologia exclusiva da Disparo Rápido que reúne um conjunto de
          recursos inteligentes para tornar os envios mais naturais e ajudar a reduzir os riscos de
          bloqueio do número.
        </p>
        <p>Entre os recursos disponíveis estão:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Simulação de digitação (&quot;typing&quot;) antes do envio</li>
          <li>Monitoramento de falhas de entrega</li>
          <li>Identificação de números inválidos</li>
          <li>Pausas preventivas durante a campanha</li>
        </ul>
        <p>
          Em comparação com a versão anterior da ferramenta, o AntiBlock Smart reduziu em até 57% os
          riscos de bloqueio.
        </p>
      </div>
    ),
  },
  {
    question: 'Quantos disparos posso fazer por dia?',
    answer: (
      <div className="space-y-3">
        <p>
          Não existe um limite oficial definido pelo WhatsApp, pois diversos fatores influenciam o
          comportamento da plataforma, como o tempo de uso do número, o histórico da conta, a
          qualidade da base de contatos, o conteúdo das mensagens e o nível de interação com os
          destinatários.
        </p>
        <p>
          Como boa prática, recomendamos não ultrapassar 300 envios por número ao dia, especialmente
          para números novos ou que ainda estão em fase de aquecimento. O ideal é aumentar
          gradativamente o volume de disparos, permitindo que o número desenvolva um histórico de
          utilização mais natural.
        </p>
        <p>
          Para operações com maior volume, a melhor estratégia é distribuir os envios entre
          diferentes números. Nesse caso, você pode contratar licenças adicionais da Disparo Rápido,
          executando campanhas simultaneamente em contas distintas, o que proporciona mais
          produtividade, escalabilidade e segurança.
        </p>
        <p>Além disso, para reduzir ainda mais os riscos de bloqueio, recomendamos:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>utilizar a tecnologia AntiBlock Smart</li>
          <li>criar variações de mensagens para evitar repetições</li>
          <li>configurar intervalos entre os envios superior a 1 minuto</li>
          <li>utilizar uma base de contatos qualificada</li>
          <li>
            responder às mensagens recebidas sempre que possível, tornando o uso do número mais
            natural
          </li>
        </ul>
      </div>
    ),
  },
  {
    question: 'Como importo minha lista de contatos?',
    answer: (
      <div className="space-y-3">
        <p>A Disparo Rápido permite duas formas de importar contatos:</p>
        <p className="font-medium text-gray-700">Colando os contatos diretamente na ferramenta</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>apenas telefone</li>
          <li>nome e telefone</li>
          <li>telefone + mensagem personalizada</li>
          <li>nome + telefone + mensagem personalizada</li>
        </ul>
        <p className="font-medium text-gray-700">Importando um arquivo CSV</p>
        <p>
          Basta acessar a aba Contatos, clicar em Escolher arquivo CSV e selecionar o arquivo em seu
          computador. A lista será carregada automaticamente.
        </p>
      </div>
    ),
  },
  {
    question: 'Qual é o formato correto do arquivo CSV?',
    answer: (
      <div className="space-y-3">
        <p>O formato recomendado possui até três colunas:</p>
        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-3 py-2 font-medium">Coluna A</th>
                <th className="px-3 py-2 font-medium">Coluna B</th>
                <th className="px-3 py-2 font-medium">Coluna C</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-200">
                <td className="px-3 py-2">Nome</td>
                <td className="px-3 py-2">Telefone</td>
                <td className="px-3 py-2">Mensagem (opcional)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Caso não queira personalizar as mensagens, basta importar somente os números de telefone.
        </p>
      </div>
    ),
  },
  {
    question: 'Como personalizo a mensagem com o nome do meu cliente?',
    answer: (
      <div className="space-y-3">
        <p>A Disparo Rápido permite utilizar variáveis dentro da mensagem. As principais são:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-800">[nome]</code>{' '}
            → substitui automaticamente pelo nome do contato
          </li>
          <li>
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-800">
              [mensagem]
            </code>{' '}
            → substitui pelo texto personalizado informado na lista de contatos
          </li>
        </ul>
        <p className="font-medium text-gray-700">Exemplo:</p>
        <p className="rounded-md bg-gray-50 p-3 italic text-gray-600">
          Olá [nome], tudo bem?
          <br />
          Preparamos uma condição especial para empresas do segmento de [mensagem].
        </p>
        <p>Cada contato receberá uma mensagem personalizada automaticamente.</p>
      </div>
    ),
  },
  {
    question: 'Posso criar variações de mensagens na mesma campanha?',
    answer: (
      <div className="space-y-3">
        <p>
          Sim. Você pode criar diversas variações para uma mesma mensagem. Durante a campanha, a
          Disparo Rápido alterna automaticamente entre essas variações, tornando os envios mais
          naturais, reduzindo a repetição do mesmo texto e contribuindo para diminuir os riscos de
          bloqueio.
        </p>
        <p>
          Basta clicar no botão Variação dentro da mensagem e cadastrar quantas versões desejar.
        </p>
      </div>
    ),
  },
  {
    question: 'Posso salvar minhas mensagens para utilizar em outras campanhas?',
    answer: (
      <div className="space-y-3">
        <p>
          Sim. Depois de criar suas mensagens e respectivas variações, você pode salvá-las como um
          Modelo.
        </p>
        <p>Para isso:</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Configure todas as mensagens da campanha.</li>
          <li>Clique em Salvar Modelo na parte inferior da aba Mensagens.</li>
          <li>Informe um nome para o modelo.</li>
        </ol>
        <p>Depois, basta acessar a aba Modelos, onde você poderá:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>aplicar o modelo em uma nova campanha</li>
          <li>editar</li>
          <li>duplicar</li>
          <li>excluir</li>
        </ul>
        <p>Assim você não precisa criar as mesmas mensagens novamente.</p>
      </div>
    ),
  },
  {
    question: 'Quantos leads gratuitos recebo por mês?',
    answer: (
      <div className="space-y-3">
        <p>
          Todos os assinantes da Disparo Rápido recebem 500 leads gratuitos por mês, através da
          parceria com a Lead Rápido.
        </p>
        <p>Esse benefício é renovado mensalmente e não é cumulativo.</p>
        <p>
          Caso precise de mais contatos, você pode adquirir novos leads diretamente pelo site da
          Lead Rápido por apenas R$ 0,01 por lead.
        </p>
      </div>
    ),
  },
  {
    question: 'Os leads são atualizados? Qual é a fonte?',
    answer: (
      <div className="space-y-3">
        <p>Sim. A base de leads é constantemente atualizada.</p>
        <p>
          Os dados são obtidos a partir de informações públicas do Google Meu Negócio (Google
          Business Profile) e do Google Maps, permitindo segmentar empresas por atividade, cidade e
          outras informações disponíveis.
        </p>
      </div>
    ),
  },
  {
    question: 'Como configuro o intervalo entre os envios?',
    answer: (
      <div className="space-y-3">
        <p>Na aba Mensagens, clique em Definir Tempo. Você pode escolher:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <span className="font-medium text-gray-700">Tempo Fixo:</span> o mesmo intervalo entre
            todos os envios
          </li>
          <li>
            <span className="font-medium text-gray-700">Tempo Aleatório:</span> define um tempo mínimo
            e máximo, e a ferramenta escolhe automaticamente um intervalo dentro dessa faixa
          </li>
        </ul>
        <p>O modo aleatório ajuda a tornar os envios mais naturais.</p>
      </div>
    ),
  },
  {
    question: 'Posso anexar imagens, vídeos e documentos?',
    answer: (
      <div className="space-y-3">
        <p>Sim. Além de mensagens de texto, você pode anexar:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>imagens</li>
          <li>vídeos</li>
          <li>áudios</li>
          <li>PDFs</li>
          <li>documentos</li>
        </ul>
        <p>Os anexos são enviados juntamente com a mensagem configurada.</p>
      </div>
    ),
  },
];

function SectionTitle({
  icon: Icon,
  iconClassName,
  title,
  action,
}: {
  icon: typeof FileText;
  iconClassName: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg',
            iconClassName
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function PaginateArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: 'left' | 'right';
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn('tutorial-paginate', direction)}
      data-state={disabled ? 'disabled' : undefined}
      aria-label={direction === 'left' ? 'Vídeo anterior' : 'Próximo vídeo'}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={onClick}
    >
      <i aria-hidden />
      <i aria-hidden />
    </button>
  );
}

function VideoTutorialsCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback((carouselApi: CarouselApi) => {
    if (!carouselApi) return;
    setCanScrollPrev(carouselApi.canScrollPrev());
    setCanScrollNext(carouselApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!api) return;

    onSelect(api);
    api.on('reInit', onSelect);
    api.on('select', onSelect);

    return () => {
      api.off('select', onSelect);
      api.off('reInit', onSelect);
    };
  }, [api, onSelect]);

  return (
    <Carousel
      opts={{ align: 'start', slidesToScroll: 1 }}
      setApi={setApi}
      className="relative w-full px-11"
    >
      <CarouselContent className="-ml-4">
        {VIDEOS.map((video) => (
          <CarouselItem
            key={video.url}
            className="basis-full pl-4 sm:basis-1/2 xl:basis-1/3"
          >
            <Card className="flex h-full flex-col overflow-hidden border-gray-100 transition-shadow hover:shadow-md">
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex aspect-video items-center justify-center overflow-hidden bg-gray-100"
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/45 backdrop-blur-sm transition-transform group-hover:scale-110">
                  <Play className="h-5 w-5 fill-white text-white" />
                </span>
              </a>
              <CardContent className="flex flex-1 flex-col p-4">
                <h3 className="font-semibold text-gray-900">{video.title}</h3>
                <p className="mt-1 flex-1 text-sm text-gray-500">{video.description}</p>
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex"
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Play className="h-4 w-4" />
                    Assistir vídeo
                  </Button>
                </a>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <PaginateArrow
        direction="left"
        disabled={!canScrollPrev}
        onClick={() => api?.scrollPrev()}
      />
      <PaginateArrow
        direction="right"
        disabled={!canScrollNext}
        onClick={() => api?.scrollNext()}
      />
    </Carousel>
  );
}

export function TutorialPage() {
  return (
    <div className="min-h-screen w-full space-y-8 rounded-xl bg-white p-6 shadow-sm md:p-8">
      {/* Header */}
      <header className="flex items-start gap-4">
        <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <GraduationCap className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Central de Ajuda</h1>
          <p className="mt-1 text-sm text-gray-500">
            Encontre vídeos, e-books, manuais e respostas rápidas para usar melhor a Disparo Rápido.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Coluna principal */}
        <div className="space-y-8 lg:col-span-2">
          {/* Vídeos tutoriais */}
          <section className="space-y-4">
            <SectionTitle
              icon={PlayCircle}
              iconClassName="bg-blue-100 text-blue-600"
              title="Vídeos tutoriais"
            />

            <VideoTutorialsCarousel />
          </section>

          {/* Perguntas frequentes */}
          <section className="space-y-4">
            <SectionTitle
              icon={HelpCircle}
              iconClassName="bg-primary/10 text-primary"
              title="Perguntas frequentes"
            />

            <Card className="border-gray-100">
              <CardContent className="p-2 sm:p-4">
                <Accordion type="single" collapsible defaultValue="faq-0" className="w-full">
                  {FAQS.map((faq, index) => (
                    <AccordionItem
                      key={faq.question}
                      value={`faq-${index}`}
                      className={cn(index === FAQS.length - 1 && 'border-b-0')}
                    >
                      <AccordionTrigger className="text-left text-sm font-semibold text-gray-900 hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm leading-relaxed text-gray-500">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Coluna lateral */}
        <div className="flex flex-col gap-6 lg:min-h-0">
          {/* E-books e manuais */}
          <section className="space-y-4">
            <SectionTitle
              icon={FileText}
              iconClassName="bg-emerald-100 text-emerald-600"
              title="E-books, manuais e modelos"
            />

            <Card className="border-gray-100">
              <CardContent className="divide-y divide-gray-100 p-2">
                {MANUALS.map((manual) => {
                  const Icon = manual.icon;
                  return (
                    <div
                      key={manual.url}
                      className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
                    >
                      <span
                        className={cn(
                          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
                          manual.iconClassName
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-gray-900">{manual.title}</p>
                        <p className="truncate text-xs text-gray-500">{manual.description}</p>
                      </div>
                      <a href={manual.url} download className="inline-flex flex-shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <Download className="h-4 w-4" />
                          {manual.downloadLabel}
                        </Button>
                      </a>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </section>

          {/* Suporte */}
          <Card className="flex flex-1 flex-col border-blue-100 bg-gradient-to-br from-blue-50 to-emerald-50/60">
            <CardContent className="flex flex-1 flex-col items-center justify-center gap-5 p-8 text-center">
              <img
                src="/support-headset-chat.png"
                alt="Suporte Disparo Rápido"
                className="h-48 w-48 flex-shrink-0 object-contain sm:h-56 sm:w-56"
              />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">Ainda precisa de ajuda?</h3>
                <p className="text-sm text-gray-500">
                  Fale com o suporte da Disparo Rápido.
                </p>
              </div>
              <Button type="button" size="lg" className="gap-2" asChild>
                <a
                  href="https://wa.me/5516992933505"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Headphones className="h-4 w-4" />
                  Entrar em contato
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
