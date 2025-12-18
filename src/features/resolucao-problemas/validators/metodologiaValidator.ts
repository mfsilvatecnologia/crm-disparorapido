import { z } from 'zod';
import { Metodologia } from '../types/projeto.types';

export const definirMetodologiaSchema = z.object({
  metodologia: z.nativeEnum(Metodologia, {
    errorMap: () => ({ message: 'Metodologia invalida' })
  })
});

export type DefinirMetodologiaInput = z.infer<typeof definirMetodologiaSchema>;
