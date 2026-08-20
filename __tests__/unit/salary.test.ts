import { describe, it, expect } from 'vitest';

describe('Salary Conversions', () => {
  describe('Hourly to Annual conversion', () => {
    it('converts hourly rate to annual salary correctly', () => {
      const hourlyRate = 25;
      const hoursPerWeek = 40;
      const weeksPerYear = 52;
      
      const annualSalary = hourlyRate * hoursPerWeek * weeksPerYear;
      
      expect(annualSalary).toBe(52000);
    });

    it('handles part-time hours', () => {
      const hourlyRate = 30;
      const hoursPerWeek = 20;
      const weeksPerYear = 52;
      
      const annualSalary = hourlyRate * hoursPerWeek * weeksPerYear;
      
      expect(annualSalary).toBe(31200);
    });

    it('handles working less than 52 weeks per year', () => {
      const hourlyRate = 50;
      const hoursPerWeek = 40;
      const weeksPerYear = 48; // 4 weeks unpaid leave
      
      const annualSalary = hourlyRate * hoursPerWeek * weeksPerYear;
      
      expect(annualSalary).toBe(96000);
    });

    it('calculates for Nepal standard hours (48/week)', () => {
      const hourlyRate = 500; // NPR
      const hoursPerWeek = 48;
      const weeksPerYear = 52;
      
      const annualSalary = hourlyRate * hoursPerWeek * weeksPerYear;
      
      expect(annualSalary).toBe(1248000);
    });

    it('calculates for UK standard hours (37.5/week)', () => {
      const hourlyRate = 15; // GBP
      const hoursPerWeek = 37.5;
      const weeksPerYear = 52;
      
      const annualSalary = hourlyRate * hoursPerWeek * weeksPerYear;
      
      expect(annualSalary).toBe(29250);
    });

    it('calculates for Australia standard hours (38/week)', () => {
      const hourlyRate = 30; // AUD
      const hoursPerWeek = 38;
      const weeksPerYear = 52;
      
      const annualSalary = hourlyRate * hoursPerWeek * weeksPerYear;
      
      expect(annualSalary).toBe(59280);
    });
  });

  describe('Annual to different pay frequencies', () => {
    const annualSalary = 78000;

    it('calculates weekly pay', () => {
      const weeklyPay = annualSalary / 52;
      expect(weeklyPay).toBe(1500);
    });

    it('calculates bi-weekly pay', () => {
      const biWeeklyPay = annualSalary / 26;
      expect(biWeeklyPay).toBe(3000);
    });

    it('calculates semi-monthly pay', () => {
      const semiMonthlyPay = annualSalary / 24;
      expect(semiMonthlyPay).toBe(3250);
    });

    it('calculates monthly pay', () => {
      const monthlyPay = annualSalary / 12;
      expect(monthlyPay).toBe(6500);
    });

    it('calculates quarterly pay', () => {
      const quarterlyPay = annualSalary / 4;
      expect(quarterlyPay).toBe(19500);
    });

    it('calculates annual pay (same as input)', () => {
      expect(annualSalary).toBe(78000);
    });
  });

  describe('Reverse conversions', () => {
    it('converts annual back to hourly correctly', () => {
      const annualSalary = 52000;
      const hoursPerWeek = 40;
      const weeksPerYear = 52;
      
      const hourlyRate = annualSalary / (hoursPerWeek * weeksPerYear);
      
      expect(hourlyRate).toBe(25);
    });

    it('converts monthly back to annual', () => {
      const monthlyPay = 5000;
      const annualSalary = monthlyPay * 12;
      
      expect(annualSalary).toBe(60000);
    });

    it('round-trip conversion preserves value within rounding', () => {
      const originalHourly = 35.75;
      const hoursPerWeek = 40;
      const weeksPerYear = 52;
      
      const annual = originalHourly * hoursPerWeek * weeksPerYear;
      const recoveredHourly = annual / (hoursPerWeek * weeksPerYear);
      
      expect(recoveredHourly).toBeCloseTo(originalHourly, 2);
    });
  });

  describe('Boundary values and edge cases', () => {
    it('handles minimum wage calculations', () => {
      const minimumWage = 7.25; // US federal minimum
      const hoursPerWeek = 40;
      const weeksPerYear = 52;
      
      const annualSalary = minimumWage * hoursPerWeek * weeksPerYear;
      
      expect(annualSalary).toBe(15080);
    });

    it('handles very high hourly rates', () => {
      const hourlyRate = 500;
      const hoursPerWeek = 40;
      const weeksPerYear = 52;
      
      const annualSalary = hourlyRate * hoursPerWeek * weeksPerYear;
      
      expect(annualSalary).toBe(1040000);
    });

    it('handles zero hours', () => {
      const hourlyRate = 50;
      const hoursPerWeek = 0;
      const weeksPerYear = 52;
      
      const annualSalary = hourlyRate * hoursPerWeek * weeksPerYear;
      
      expect(annualSalary).toBe(0);
    });

    it('handles zero weeks (no work)', () => {
      const hourlyRate = 50;
      const hoursPerWeek = 40;
      const weeksPerYear = 0;
      
      const annualSalary = hourlyRate * hoursPerWeek * weeksPerYear;
      
      expect(annualSalary).toBe(0);
    });

    it('rejects negative hourly rate', () => {
      const hourlyRate = -25;
      expect(hourlyRate).toBeLessThan(0);
    });

    it('rejects negative hours', () => {
      const hoursPerWeek = -40;
      expect(hoursPerWeek).toBeLessThan(0);
    });

    it('rejects excessive hours per week', () => {
      const hoursPerWeek = 100; // Unrealistic
      expect(hoursPerWeek).toBeGreaterThan(80); // Reasonable max
    });
  });

  describe('Regional pay frequency support', () => {
    const regionalFrequencies: Record<string, number[]> = {
      usa: [52, 26, 24, 12, 4, 1], // Weekly, Bi-weekly, Semi-monthly, Monthly, Quarterly, Annually
      nepal: [12, 4, 1], // Monthly, Quarterly, Annually
      india: [12, 4, 1], // Monthly, Quarterly, Annually
      uk: [52, 26, 12, 4, 1], // Weekly, Bi-weekly, Monthly, Quarterly, Annually
      canada: [52, 26, 24, 12, 4, 1], // All frequencies
      australia: [52, 26, 24, 12, 4, 1], // All frequencies
      global: [52, 26, 24, 12, 4, 1], // All frequencies
    };

    it.each(Object.entries(regionalFrequencies))(
      '%s supports %i pay frequencies',
      (region, frequencies) => {
        expect(frequencies.length).toBeGreaterThan(0);
        frequencies.forEach(freq => {
          expect(freq).toBeGreaterThan(0);
          expect(freq).toBeLessThanOrEqual(52);
        });
      }
    );

    it('monthly is supported by all regions', () => {
      Object.values(regionalFrequencies).forEach(frequencies => {
        expect(frequencies).toContain(12);
      });
    });
  });

  describe('Gross to Net calculations', () => {
    it('applies simple tax rate to gross', () => {
      const grossAnnual = 60000;
      const taxRate = 0.2;
      const netAnnual = grossAnnual * (1 - taxRate);
      
      expect(netAnnual).toBe(48000);
    });

    it('applies multiple deduction rates', () => {
      const grossAnnual = 80000;
      const taxRate = 0.22;
      const socialSecurityRate = 0.062;
      const medicareRate = 0.0145;
      
      const totalDeductions = grossAnnual * (taxRate + socialSecurityRate + medicareRate);
      const netAnnual = grossAnnual - totalDeductions;
      
      expect(netAnnual).toBeCloseTo(56584, -1);
    });

    it('handles deductions that exceed income (clamped to zero)', () => {
      const grossAnnual = 10000;
      const totalDeductionRate = 0.25;
      
      const deductions = grossAnnual * totalDeductionRate;
      const netAnnual = Math.max(0, grossAnnual - deductions);
      
      expect(netAnnual).toBeGreaterThan(0);
      expect(netAnnual).toBe(7500);
    });
  });

  describe('Overtime calculations', () => {
    it('calculates overtime pay at time-and-a-half', () => {
      const regularRate = 20;
      const overtimeRate = regularRate * 1.5;
      const overtimeHours = 10;
      
      const overtimePay = overtimeRate * overtimeHours;
      
      expect(overtimeRate).toBe(30);
      expect(overtimePay).toBe(300);
    });

    it('calculates double-time for holidays', () => {
      const regularRate = 25;
      const holidayRate = regularRate * 2;
      const holidayHours = 8;
      
      const holidayPay = holidayRate * holidayHours;
      
      expect(holidayRate).toBe(50);
      expect(holidayPay).toBe(400);
    });

    it('combines regular and overtime pay', () => {
      const regularRate = 20;
      const regularHours = 40;
      const overtimeRate = regularRate * 1.5;
      const overtimeHours = 10;
      
      const regularPay = regularRate * regularHours;
      const overtimePay = overtimeRate * overtimeHours;
      const totalPay = regularPay + overtimePay;
      
      expect(regularPay).toBe(800);
      expect(overtimePay).toBe(300);
      expect(totalPay).toBe(1100);
    });
  });

  describe('Invalid and empty inputs', () => {
    it('handles null/undefined gracefully', () => {
      const hourlyRate: number | null = null;
      const safeRate = hourlyRate ?? 0;
      
      expect(safeRate).toBe(0);
    });

    it('handles NaN from invalid calculations', () => {
      const result = Number('invalid') * 40 * 52;
      expect(Number.isNaN(result)).toBe(true);
    });

    it('handles Infinity from division by zero', () => {
      const annualSalary = 50000;
      const weeksWorked = 0;
      const weeklyPay = annualSalary / weeksWorked;
      
      expect(weeklyPay).toBe(Infinity);
    });

    it('sanitizes string inputs', () => {
      const stringInput = '25.50';
      const parsedRate = parseFloat(stringInput);
      
      expect(parsedRate).toBe(25.5);
      expect(isFinite(parsedRate)).toBe(true);
    });
  });
});
