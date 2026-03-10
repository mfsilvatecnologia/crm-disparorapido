import { Download, FileText } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

const PDFS = [
  { url: '/manual_de_uso_disparo_rapido.pdf', title: 'Manual de uso Disparo Rápido' },
  { url: '/agentes-ia-disparo-rapido.pdf', title: 'Agentes IA Disparo Rápido' },
  { url: '/guia-pratico-para-vendas-no-whatsapp.pdf', title: 'Guia prático para vendas no WhatsApp' },
  { url: '/manual-antibanimento.pdf', title: 'Manual antibanimento' },
] as const;

export function TutorialPage() {
  return (
    <div className="min-h-screen w-full rounded-xl bg-white p-6 md:p-8 shadow-sm space-y-6">
      <ul className="space-y-4">
            {PDFS.map((pdf) => (
              <li
                key={pdf.url}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors"
              >
                <div className="flex gap-3 min-w-0">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="font-semibold text-gray-900">{pdf.title}</p>
                </div>
                <a href={pdf.url} download className="inline-flex flex-shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="inline-flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Baixar PDF
                  </Button>
                </a>
              </li>
            ))}
      </ul>
    </div>
  );
}

