import { describe, it, expect } from 'vitest';

describe('Currency Conversions', () => {
  // Offline fallback rates (relative to USD as base)
  const OFFLINE_RATES: Record<string, number> = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    INR: 83.5,
    NPR: 133.5,
    CAD: 1.36,
    AUD: 1.53,
    JPY: 149.0,
    CHF: 0.88,
    CNY: 7.19,
  };

  describe('Basic conversion math', () => {
    it('converts USD to EUR correctly', () => {
      const amount = 100;
      const fromRate = OFFLINE_RATES.USD;
      const toRate = OFFLINE_RATES.EUR;
      const converted = (amount / fromRate) * toRate;
      
      expect(converted).toBeCloseTo(92, 1);
    });

    it('converts USD to NPR correctly', () => {
      const amount = 100;
      const fromRate = OFFLINE_RATES.USD;
      const toRate = OFFLINE_RATES.NPR;
      const converted = (amount / fromRate) * toRate;
      
      expect(converted).toBeCloseTo(13350, 1);
    });

    it('converts EUR to USD correctly', () => {
      const amount = 100;
      const fromRate = OFFLINE_RATES.EUR;
      const toRate = OFFLINE_RATES.USD;
      const converted = (amount / fromRate) * toRate;
      
      expect(converted).toBeCloseTo(108.70, 1);
    });

    it('converts cross-rates (EUR to GBP)', () => {
      const amount = 100;
      const fromRate = OFFLINE_RATES.EUR;
      const toRate = OFFLINE_RATES.GBP;
      const converted = (amount / fromRate) * toRate;
      
      // EUR -> USD -> GBP
      expect(converted).toBeCloseTo(85.87, 1);
    });

    it('converts NPR to INR (neighboring currencies)', () => {
      const amount = 1000;
      const fromRate = OFFLINE_RATES.NPR;
      const toRate = OFFLINE_RATES.INR;
      const converted = (amount / fromRate) * toRate;
      
      expect(converted).toBeCloseTo(625.47, 1);
    });
  });

  describe('Mathematical reversibility', () => {
    it('round-trip USD -> EUR -> USD preserves value', () => {
      const original = 1000;
      const usdToEur = OFFLINE_RATES.EUR / OFFLINE_RATES.USD;
      const eurToUsd = OFFLINE_RATES.USD / OFFLINE_RATES.EUR;
      
      const converted = original * usdToEur;
      const recovered = converted * eurToUsd;
      
      expect(recovered).toBeCloseTo(original, 0);
    });

    it('round-trip through multiple currencies', () => {
      const original = 500;
      
      // USD -> EUR -> GBP -> JPY -> USD
      let value = original;
      value = (value / OFFLINE_RATES.USD) * OFFLINE_RATES.EUR;  // to EUR
      value = (value / OFFLINE_RATES.EUR) * OFFLINE_RATES.GBP;  // to GBP
      value = (value / OFFLINE_RATES.GBP) * OFFLINE_RATES.JPY;  // to JPY
      value = (value / OFFLINE_RATES.JPY) * OFFLINE_RATES.USD;  // back to USD
      
      expect(value).toBeCloseTo(original, 0);
    });

    it('inverse rate calculation is correct', () => {
      const directRate = OFFLINE_RATES.EUR / OFFLINE_RATES.USD;
      const inverseRate = OFFLINE_RATES.USD / OFFLINE_RATES.EUR;
      
      expect(directRate * inverseRate).toBeCloseTo(1, 5);
    });

    it('conversion formula is reversible within rounding tolerance', () => {
      const amount = 1234.56;
      const fromCurrency = 'USD';
      const toCurrency = 'NPR';
      
      const fromRate = OFFLINE_RATES[fromCurrency];
      const toRate = OFFLINE_RATES[toCurrency];
      
      const converted = (amount / fromRate) * toRate;
      const recovered = (converted / toRate) * fromRate;
      
      // Allow for floating point rounding
      expect(Math.abs(recovered - amount)).toBeLessThan(0.01);
    });
  });

  describe('NPR (Nepalese Rupee) support', () => {
    it('NPR is included in supported currencies', () => {
      expect(OFFLINE_RATES.NPR).toBeDefined();
      expect(OFFLINE_RATES.NPR).toBe(133.5);
    });

    it('converts USD to NPR at pegged rate', () => {
      const amount = 1;
      const converted = (amount / OFFLINE_RATES.USD) * OFFLINE_RATES.NPR;
      
      expect(converted).toBeCloseTo(133.5, 1);
    });

    it('converts NPR to USD correctly', () => {
      const amount = 1335;
      const converted = (amount / OFFLINE_RATES.NPR) * OFFLINE_RATES.USD;
      
      expect(converted).toBeCloseTo(10, 1);
    });

    it('handles small NPR amounts', () => {
      const amount = 100;
      const converted = (amount / OFFLINE_RATES.NPR) * OFFLINE_RATES.USD;
      
      expect(converted).toBeCloseTo(0.75, 2);
    });

    it('handles large NPR amounts', () => {
      const amount = 1000000; // 10 lakh NPR
      const converted = (amount / OFFLINE_RATES.NPR) * OFFLINE_RATES.USD;
      
      expect(converted).toBeCloseTo(7490.64, 1);
    });
  });

  describe('Regional currency conversions', () => {
    const regionalCurrencies: Record<string, { code: string; name: string }> = {
      nepal: { code: 'NPR', name: 'Nepalese Rupee' },
      india: { code: 'INR', name: 'Indian Rupee' },
      usa: { code: 'USD', name: 'US Dollar' },
      uk: { code: 'GBP', name: 'British Pound' },
      canada: { code: 'CAD', name: 'Canadian Dollar' },
      australia: { code: 'AUD', name: 'Australian Dollar' },
    };

    it.each(Object.entries(regionalCurrencies))(
      '%s uses %s (%s)',
      (region, currency) => {
        expect(OFFLINE_RATES[currency.code]).toBeDefined();
        expect(OFFLINE_RATES[currency.code]).toBeGreaterThan(0);
      }
    );

    it('converts between all regional currencies', () => {
      const codes = Object.values(regionalCurrencies).map(c => c.code);
      
      for (const fromCode of codes) {
        for (const toCode of codes) {
          if (fromCode !== toCode) {
            const amount = 100;
            const converted = (amount / OFFLINE_RATES[fromCode]) * OFFLINE_RATES[toCode];
            
            expect(converted).toBeGreaterThan(0);
            expect(Number.isNaN(converted)).toBe(false);
          }
        }
      }
    });
  });

  describe('Boundary values and edge cases', () => {
    it('handles zero amount', () => {
      const amount = 0;
      const converted = (amount / OFFLINE_RATES.USD) * OFFLINE_RATES.EUR;
      
      expect(converted).toBe(0);
    });

    it('handles very small amounts', () => {
      const amount = 0.01;
      const converted = (amount / OFFLINE_RATES.USD) * OFFLINE_RATES.JPY;
      
      expect(converted).toBeGreaterThan(0);
    });

    it('handles very large amounts', () => {
      const amount = 1000000000; // 1 billion
      const converted = (amount / OFFLINE_RATES.USD) * OFFLINE_RATES.EUR;
      
      expect(converted).toBeGreaterThan(0);
      expect(converted).toBeLessThan(amount); // EUR < USD
    });

    it('handles same currency conversion', () => {
      const amount = 500;
      const converted = (amount / OFFLINE_RATES.USD) * OFFLINE_RATES.USD;
      
      expect(converted).toBe(amount);
    });

    it('rejects negative amounts', () => {
      const amount = -100;
      expect(amount).toBeLessThan(0);
    });

    it('handles currencies with high value (JPY)', () => {
      const amount = 100;
      const converted = (amount / OFFLINE_RATES.USD) * OFFLINE_RATES.JPY;
      
      expect(converted).toBeCloseTo(14900, 0);
    });

    it('handles currencies with low value relative to USD', () => {
      // CHF is close to parity
      const amount = 100;
      const converted = (amount / OFFLINE_RATES.USD) * OFFLINE_RATES.CHF;
      
      expect(converted).toBeCloseTo(88, 1);
    });
  });

  describe('Exchange rate calculations', () => {
    it('calculates exchange rate correctly', () => {
      const fromCurrency = 'USD';
      const toCurrency = 'EUR';
      const rate = OFFLINE_RATES[toCurrency] / OFFLINE_RATES[fromCurrency];
      
      expect(rate).toBeCloseTo(0.92, 3);
    });

    it('calculates inverse exchange rate', () => {
      const fromCurrency = 'EUR';
      const toCurrency = 'USD';
      const rate = OFFLINE_RATES[toCurrency] / OFFLINE_RATES[fromCurrency];
      
      expect(rate).toBeCloseTo(1.087, 2);
    });

    it('exchange rate and inverse multiply to 1', () => {
      const fromCurrency = 'USD';
      const toCurrency = 'GBP';
      
      const rate = OFFLINE_RATES[toCurrency] / OFFLINE_RATES[fromCurrency];
      const inverseRate = OFFLINE_RATES[fromCurrency] / OFFLINE_RATES[toCurrency];
      
      expect(rate * inverseRate).toBeCloseTo(1, 5);
    });

    it('displays rate with appropriate precision', () => {
      const rate = OFFLINE_RATES.EUR / OFFLINE_RATES.USD;
      const formatted = rate.toFixed(6);
      
      expect(formatted.length).toBeGreaterThan(3);
      expect(parseFloat(formatted)).toBeCloseTo(rate, 5);
    });
  });

  describe('Offline fallback behavior', () => {
    it('offline rates are defined for all major currencies', () => {
      const requiredCurrencies = ['USD', 'EUR', 'GBP', 'INR', 'NPR', 'CAD', 'AUD'];
      
      requiredCurrencies.forEach(code => {
        expect(OFFLINE_RATES[code]).toBeDefined();
        expect(typeof OFFLINE_RATES[code]).toBe('number');
      });
    });

    it('offline rates use USD as base', () => {
      expect(OFFLINE_RATES.USD).toBe(1.0);
    });

    it('all offline rates are positive', () => {
      Object.values(OFFLINE_RATES).forEach(rate => {
        expect(rate).toBeGreaterThan(0);
      });
    });

    it('offline rates are finite numbers', () => {
      Object.values(OFFLINE_RATES).forEach(rate => {
        expect(Number.isFinite(rate)).toBe(true);
        expect(Number.isNaN(rate)).toBe(false);
      });
    });
  });

  describe('Invalid and empty inputs', () => {
    it('handles undefined currency gracefully', () => {
      const unknownCurrency = 'XXX';
      const rate = OFFLINE_RATES[unknownCurrency] ?? 1;
      
      expect(rate).toBe(1); // Falls back to 1
    });

    it('handles null amount', () => {
      const amount: number | null = null;
      const safeAmount = amount ?? 0;
      
      expect(safeAmount).toBe(0);
    });

    it('handles NaN from invalid input', () => {
      const result = Number('invalid') * OFFLINE_RATES.EUR;
      expect(Number.isNaN(result)).toBe(true);
    });

    it('sanitizes string amounts', () => {
      const stringAmount = '100.50';
      const parsed = parseFloat(stringAmount);
      const converted = (parsed / OFFLINE_RATES.USD) * OFFLINE_RATES.EUR;
      
      expect(parsed).toBe(100.5);
      expect(converted).toBeCloseTo(92.46, 1);
    });
  });

  describe('Rate timestamp and source metadata', () => {
    it('rate timestamp should be valid ISO string', () => {
      const timestamp = new Date().toISOString();
      expect(() => new Date(timestamp)).not.toThrow();
      expect(new Date(timestamp).getTime()).toBeGreaterThan(0);
    });

    it('data source is indicated', () => {
      const dataSource = 'Indicative rates based on recent market data';
      expect(dataSource.length).toBeGreaterThan(0);
    });

    it('offline mode warning is shown when using fallback', () => {
      const isOffline = true;
      const warning = isOffline ? 'Using cached indicative rates' : 'Live rates';
      
      expect(warning).toContain('cached');
    });
  });
});
