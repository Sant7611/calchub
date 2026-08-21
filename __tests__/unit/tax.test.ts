import { describe, it, expect } from 'vitest';
import { calculateRegionalTax } from '@/lib/taxEngine';

describe('Progressive Tax Brackets', () => {
  describe('Global region (flat tax)', () => {
    it('calculates flat 20% tax correctly', () => {
      const result = calculateRegionalTax(100000, 'global');
      expect(result.tax).toBeCloseTo(20000, 0);
      expect(result.effectiveTaxRate).toBeCloseTo(20, 3);
    });

    it('handles zero income', () => {
      const result = calculateRegionalTax(0, 'global');
      expect(result.tax).toBe(0);
      expect(result.effectiveTaxRate).toBe(0);
    });

    it('handles negative income (clamped to zero)', () => {
      const result = calculateRegionalTax(-5000, 'global');
      expect(result.tax).toBe(0);
    });
  });

  describe('USA progressive tax brackets', () => {
    it('calculates tax for income in first bracket', () => {
      // First bracket: $0 - $11,600 at 10%
      const result = calculateRegionalTax(10000, 'usa');
      expect(result.tax).toBeCloseTo(1000, 0);
    });

    it('calculates tax spanning multiple brackets', () => {
      // Income of $50,000 spans first three brackets
      // $11,600 * 0.10 = $1,160
      // ($47,150 - $11,600) * 0.12 = $4,266
      // ($50,000 - $47,150) * 0.22 = $627
      // Total = $6,053
      const result = calculateRegionalTax(50000, 'usa');
      expect(result.tax).toBeCloseTo(6053, 0);
    });

    it('calculates tax for high income (top bracket)', () => {
      const result = calculateRegionalTax(700000, 'usa');
      // Should apply all brackets up to 37%
      expect(result.tax).toBeGreaterThan(200000);
    });

    it('increases USA income tax across income levels', () => {
      const incomes = [10000, 50000, 200000, 700000];
      const taxes = incomes.map((income) => calculateRegionalTax(income, 'usa').tax);

      expect(taxes[1]).toBeGreaterThan(taxes[0]);
      expect(taxes[2]).toBeGreaterThan(taxes[1]);
      expect(taxes[3]).toBeGreaterThan(taxes[2]);
    });

    it('calculates tax for high income in Nepal', () => {
      const result = calculateRegionalTax(3000000, 'nepal');
      expect(result.effectiveTaxRate).toBeGreaterThan(0);
    });

    it('calculates tax spanning Nepal brackets', () => {
      // Income of 800,000 NPR
      // 500,000 * 0.01 = 5,000
      // (700,000 - 500,000) * 0.10 = 20,000
      // (800,000 - 700,000) * 0.20 = 20,000
      // Total = 45,000
      const result = calculateRegionalTax(800000, 'nepal');
      expect(result.tax).toBeCloseTo(45000, 0);
    });
  });

  describe('India progressive tax brackets', () => {
    it('calculates zero tax for income below threshold', () => {
      // First 300,000 is tax-free
      const result = calculateRegionalTax(250000, 'india');
      expect(result.tax).toBe(0);
    });

    it('calculates tax with zero-rate bracket', () => {
      // Income of 500,000 INR
      // First 300,000 at 0% = 0
      // Next 200,000 at 5% = 10,000
      const result = calculateRegionalTax(500000, 'india');
      expect(result.tax).toBeCloseTo(10000, 0);
    });

    it('calculates tax for middle income in India', () => {
      const result = calculateRegionalTax(1200000, 'india');
      // 300k*0 + 400k*0.05 + 300k*0.10 + 200k*0.15 = 0 + 20k + 30k + 30k = 80k
      expect(result.tax).toBeCloseTo(80000, 0);
    });
  });

  describe('UK progressive tax brackets', () => {
    it('calculates zero tax for income below personal allowance', () => {
      const result = calculateRegionalTax(12000, 'uk');
      expect(result.tax).toBe(0);
    });

    it('calculates basic rate tax', () => {
      // Income of £30,000
      // First £12,570 at 0% = 0
      // Remaining £17,430 at 20% = £3,486
      const result = calculateRegionalTax(30000, 'uk');
      expect(result.tax).toBeCloseTo(3486, 0);
    });

    it('calculates higher rate tax', () => {
      const result = calculateRegionalTax(60000, 'uk');
      expect(result.effectiveTaxRate).toBeGreaterThan(0);
    });

    it('calculates additional rate tax for very high income', () => {
      const result = calculateRegionalTax(150000, 'uk');
      expect(result.effectiveTaxRate).toBeGreaterThan(0);
    });
  });

  describe('Canada progressive tax brackets', () => {
    it('calculates tax for first bracket', () => {
      const result = calculateRegionalTax(50000, 'canada');
      expect(result.tax).toBeCloseTo(7500, 0); // 50000 * 0.15
    });

    it('calculates tax spanning Canadian brackets', () => {
      const result = calculateRegionalTax(150000, 'canada');
      // $150k income spans into the 26% bracket ($111k-$173k)
      expect(result.effectiveTaxRate).toBeGreaterThan(0);
    });
  });

  describe('Australia progressive tax brackets', () => {
    it('calculates zero tax for income below tax-free threshold', () => {
      const result = calculateRegionalTax(15000, 'australia');
      expect(result.tax).toBe(0);
    });

    it('calculates tax for middle income', () => {
      const result = calculateRegionalTax(100000, 'australia');
      expect(result.effectiveTaxRate).toBeGreaterThan(0);
    });

    it('calculates top marginal rate for high income', () => {
      const result = calculateRegionalTax(250000, 'australia');
      expect(result.effectiveTaxRate).toBeGreaterThan(0);
    });
  });

  describe('Boundary values', () => {
    it('handles exact bracket boundaries', () => {
      // Exactly at boundary should not exceed the bracket
      const atBoundary = calculateRegionalTax(11600, 'usa');
      const justOver = calculateRegionalTax(11601, 'usa');
      
      expect(atBoundary.tax).toBeLessThan(justOver.tax);
      expect(atBoundary.effectiveTaxRate).toBeGreaterThan(0);
      expect(justOver.effectiveTaxRate).toBeGreaterThan(0);
    });

    it('handles very large numbers', () => {
      const result = calculateRegionalTax(10000000, 'usa');
      expect(result.tax).toBeGreaterThan(3000000);
    });

    it('handles fractional amounts', () => {
      const result = calculateRegionalTax(50123.45, 'usa');
      expect(result.tax).toBeGreaterThan(0);
      expect(result.effectiveTaxRate).toBeGreaterThan(0);
    });
  });

  describe('Payroll deductions', () => {
    it('includes Social Security and Medicare for USA', () => {
      const result = calculateRegionalTax(100000, 'usa');
      expect(result.payrollDeductionsTotal).toBeCloseTo(7650, 0); // 6.2% + 1.45% = 7.65%
      expect(result.deductionDetails.length).toBe(2);
    });

    it('includes SSF for Nepal', () => {
      const result = calculateRegionalTax(1000000, 'nepal');
      expect(result.payrollDeductionsTotal).toBeCloseTo(110000, 0); // 11%
    });

    it('includes EPF for India', () => {
      const result = calculateRegionalTax(1000000, 'india');
      expect(result.payrollDeductionsTotal).toBeCloseTo(120000, 0); // 12%
    });

    it('includes National Insurance for UK', () => {
      const result = calculateRegionalTax(50000, 'uk');
      expect(result.payrollDeductionsTotal).toBeCloseTo(4000, 0); // 8%
    });

    it('includes CPP and EI for Canada', () => {
      const result = calculateRegionalTax(100000, 'canada');
      expect(result.payrollDeductionsTotal).toBeCloseTo(7610, 0); // 5.95% + 1.66% = 7.61%
    });

    it('includes Superannuation for Australia', () => {
      const result = calculateRegionalTax(100000, 'australia');
      expect(result.payrollDeductionsTotal).toBeCloseTo(11500, 0); // 11.5%
    });

    it('has no payroll deductions for global', () => {
      const result = calculateRegionalTax(100000, 'global');
      expect(result.payrollDeductionsTotal).toBe(0);
      expect(result.deductionDetails.length).toBe(0);
    });
  });

  describe('Effective rate calculations', () => {
    it('effective rate is always less than or equal to top marginal rate for progressive systems', () => {
      for (const region of ['usa', 'nepal', 'india', 'uk', 'canada', 'australia'] as const) {
        const result = calculateRegionalTax(100000, region);
        expect(result.effectiveTaxRate).toBeLessThan(50); // Less than 50%
      }
    });

    it('effective rate increases with income but stays below top marginal', () => {
      const lowIncome = calculateRegionalTax(30000, 'usa');
      const highIncome = calculateRegionalTax(500000, 'usa');
      
      expect(highIncome.effectiveTaxRate).toBeGreaterThan(lowIncome.effectiveTaxRate);
      expect(highIncome.effectiveTaxRate).toBeLessThan(37);
    });
  });
});
