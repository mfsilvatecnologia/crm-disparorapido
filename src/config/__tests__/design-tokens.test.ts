/**
 * Design Tokens Tests
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 */

import { describe, it, expect } from 'vitest';
import {
  leadStatusConfig,
  opportunityStatusConfig,
  campaignStatusConfig,
  contractStatusConfig,
  customerStatusConfig,
  scoreConfig,
  getScoreRange,
  getScoreConfig,
  isValidLeadStatus,
  isValidOpportunityStatus,
  isValidCampaignStatus,
  isValidContractStatus,
  isValidCustomerStatus,
  getStatusConfig,
} from '../design-tokens';

describe('Design Tokens', () => {
  describe('leadStatusConfig', () => {
    it('should have all lead status values', () => {
      expect(leadStatusConfig).toHaveProperty('novo');
      expect(leadStatusConfig).toHaveProperty('qualificado');
      expect(leadStatusConfig).toHaveProperty('contatado');
      expect(leadStatusConfig).toHaveProperty('convertido');
      expect(leadStatusConfig).toHaveProperty('descartado');
    });

    it('should have label, icon, and colors for each status', () => {
      Object.values(leadStatusConfig).forEach((config) => {
        expect(config).toHaveProperty('label');
        expect(config).toHaveProperty('icon');
        expect(config).toHaveProperty('colors');
        expect(config.colors).toHaveProperty('bg');
        expect(config.colors).toHaveProperty('text');
        expect(config.colors).toHaveProperty('border');
      });
    });
  });

  describe('opportunityStatusConfig', () => {
    it('should have all opportunity status values', () => {
      expect(opportunityStatusConfig).toHaveProperty('prospeccao');
      expect(opportunityStatusConfig).toHaveProperty('qualificacao');
      expect(opportunityStatusConfig).toHaveProperty('proposta');
      expect(opportunityStatusConfig).toHaveProperty('negociacao');
      expect(opportunityStatusConfig).toHaveProperty('fechado_ganho');
      expect(opportunityStatusConfig).toHaveProperty('fechado_perdido');
    });
  });

  describe('campaignStatusConfig', () => {
    it('should have all campaign status values', () => {
      expect(campaignStatusConfig).toHaveProperty('rascunho');
      expect(campaignStatusConfig).toHaveProperty('agendada');
      expect(campaignStatusConfig).toHaveProperty('ativa');
      expect(campaignStatusConfig).toHaveProperty('pausada');
      expect(campaignStatusConfig).toHaveProperty('concluida');
    });
  });

  describe('contractStatusConfig', () => {
    it('should have all contract status values', () => {
      expect(contractStatusConfig).toHaveProperty('ativo');
      expect(contractStatusConfig).toHaveProperty('inativo');
      expect(contractStatusConfig).toHaveProperty('suspenso');
      expect(contractStatusConfig).toHaveProperty('cancelado');
    });
  });

  describe('customerStatusConfig', () => {
    it('should have all customer status values', () => {
      expect(customerStatusConfig).toHaveProperty('ativo');
      expect(customerStatusConfig).toHaveProperty('inativo');
      expect(customerStatusConfig).toHaveProperty('prospecto');
      expect(customerStatusConfig).toHaveProperty('churned');
    });
  });

  describe('scoreConfig', () => {
    it('should have all score ranges', () => {
      expect(scoreConfig).toHaveProperty('low');
      expect(scoreConfig).toHaveProperty('medium');
      expect(scoreConfig).toHaveProperty('high');
      expect(scoreConfig).toHaveProperty('excellent');
    });

    it('should have correct ranges', () => {
      expect(scoreConfig.low.min).toBe(0);
      expect(scoreConfig.low.max).toBe(50);
      expect(scoreConfig.medium.min).toBe(51);
      expect(scoreConfig.medium.max).toBe(70);
      expect(scoreConfig.high.min).toBe(71);
      expect(scoreConfig.high.max).toBe(89);
      expect(scoreConfig.excellent.min).toBe(90);
      expect(scoreConfig.excellent.max).toBe(100);
    });

    it('should have color, bg, and label for each range', () => {
      Object.values(scoreConfig).forEach((config) => {
        expect(config).toHaveProperty('color');
        expect(config).toHaveProperty('bg');
        expect(config).toHaveProperty('label');
      });
    });
  });

  describe('getScoreRange', () => {
    it('should return "low" for scores 0-50', () => {
      expect(getScoreRange(0)).toBe('low');
      expect(getScoreRange(25)).toBe('low');
      expect(getScoreRange(50)).toBe('low');
    });

    it('should return "medium" for scores 51-70', () => {
      expect(getScoreRange(51)).toBe('medium');
      expect(getScoreRange(60)).toBe('medium');
      expect(getScoreRange(70)).toBe('medium');
    });

    it('should return "high" for scores 71-89', () => {
      expect(getScoreRange(71)).toBe('high');
      expect(getScoreRange(80)).toBe('high');
      expect(getScoreRange(89)).toBe('high');
    });

    it('should return "excellent" for scores 90-100', () => {
      expect(getScoreRange(90)).toBe('excellent');
      expect(getScoreRange(95)).toBe('excellent');
      expect(getScoreRange(100)).toBe('excellent');
    });
  });

  describe('getScoreConfig', () => {
    it('should return the correct config for a score', () => {
      const lowConfig = getScoreConfig(45);
      expect(lowConfig.label).toBe('Baixo');
      expect(lowConfig.color).toBe('text-red-500');

      const mediumConfig = getScoreConfig(65);
      expect(mediumConfig.label).toBe('Médio');
      expect(mediumConfig.color).toBe('text-amber-500');

      const highConfig = getScoreConfig(85);
      expect(highConfig.label).toBe('Alto');
      expect(highConfig.color).toBe('text-blue-500');

      const excellentConfig = getScoreConfig(95);
      expect(excellentConfig.label).toBe('Excelente');
      expect(excellentConfig.color).toBe('text-green-500');
    });
  });

  describe('Type Guards', () => {
    describe('isValidLeadStatus', () => {
      it('should return true for valid lead statuses', () => {
        expect(isValidLeadStatus('novo')).toBe(true);
        expect(isValidLeadStatus('qualificado')).toBe(true);
        expect(isValidLeadStatus('contatado')).toBe(true);
        expect(isValidLeadStatus('convertido')).toBe(true);
        expect(isValidLeadStatus('descartado')).toBe(true);
      });

      it('should return false for invalid lead statuses', () => {
        expect(isValidLeadStatus('invalid')).toBe(false);
        expect(isValidLeadStatus('')).toBe(false);
        expect(isValidLeadStatus('ativo')).toBe(false);
      });
    });

    describe('isValidOpportunityStatus', () => {
      it('should return true for valid opportunity statuses', () => {
        expect(isValidOpportunityStatus('prospeccao')).toBe(true);
        expect(isValidOpportunityStatus('fechado_ganho')).toBe(true);
      });

      it('should return false for invalid opportunity statuses', () => {
        expect(isValidOpportunityStatus('novo')).toBe(false);
      });
    });

    describe('isValidCampaignStatus', () => {
      it('should return true for valid campaign statuses', () => {
        expect(isValidCampaignStatus('rascunho')).toBe(true);
        expect(isValidCampaignStatus('ativa')).toBe(true);
      });

      it('should return false for invalid campaign statuses', () => {
        expect(isValidCampaignStatus('novo')).toBe(false);
      });
    });

    describe('isValidContractStatus', () => {
      it('should return true for valid contract statuses', () => {
        expect(isValidContractStatus('ativo')).toBe(true);
        expect(isValidContractStatus('cancelado')).toBe(true);
      });

      it('should return false for invalid contract statuses', () => {
        expect(isValidContractStatus('novo')).toBe(false);
      });
    });

    describe('isValidCustomerStatus', () => {
      it('should return true for valid customer statuses', () => {
        expect(isValidCustomerStatus('ativo')).toBe(true);
        expect(isValidCustomerStatus('churned')).toBe(true);
      });

      it('should return false for invalid customer statuses', () => {
        expect(isValidCustomerStatus('novo')).toBe(false);
      });
    });
  });

  describe('getStatusConfig', () => {
    it('should return lead config for lead entity type', () => {
      const config = getStatusConfig('lead', 'novo');
      expect(config).toBeDefined();
      expect(config?.label).toBe('Novo');
    });

    it('should return opportunity config for opportunity entity type', () => {
      const config = getStatusConfig('opportunity', 'proposta');
      expect(config).toBeDefined();
      expect(config?.label).toBe('Proposta');
    });

    it('should return undefined for invalid status', () => {
      const config = getStatusConfig('lead', 'invalid');
      expect(config).toBeUndefined();
    });
  });
});
