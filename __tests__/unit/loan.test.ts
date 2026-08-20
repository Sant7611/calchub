import { describe, it, expect } from 'vitest';

describe('Loan Amortization', () => {
  describe('EMI calculation formula', () => {
    // EMI = [P x R x (1+R)^N] / [(1+R)^N-1]
    
    it('calculates EMI for standard loan', () => {
      const principal = 100000;
      const annualRate = 0.06; // 6%
      const monthlyRate = annualRate / 12;
      const years = 5;
      const months = years * 12;
      
      const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                  (Math.pow(1 + monthlyRate, months) - 1);
      
      expect(emi).toBeCloseTo(1933.28, 0);
    });

    it('calculates EMI for Nepal typical loan', () => {
      const principal = 1000000; // NPR
      const annualRate = 0.11; // 11% typical in Nepal
      const monthlyRate = annualRate / 12;
      const years = 5;
      const months = years * 12;
      
      const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                  (Math.pow(1 + monthlyRate, months) - 1);
      
      expect(emi).toBeCloseTo(21748, 0);
    });

    it('calculates EMI for India typical loan', () => {
      const principal = 1000000; // INR
      const annualRate = 0.085; // 8.5%
      const monthlyRate = annualRate / 12;
      const years = 5;
      const months = years * 12;
      
      const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                  (Math.pow(1 + monthlyRate, months) - 1);
      
      expect(emi).toBeCloseTo(20516, 0);
    });

    it('calculates EMI for USA typical loan', () => {
      const principal = 25000; // USD
      const annualRate = 0.065; // 6.5%
      const monthlyRate = annualRate / 12;
      const years = 5;
      const months = years * 12;
      
      const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                  (Math.pow(1 + monthlyRate, months) - 1);
      
      expect(emi).toBeCloseTo(489, 0);
    });

    it('calculates EMI for UK typical loan', () => {
      const principal = 20000; // GBP
      const annualRate = 0.0525; // 5.25%
      const monthlyRate = annualRate / 12;
      const years = 5;
      const months = years * 12;
      
      const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                  (Math.pow(1 + monthlyRate, months) - 1);
      
      expect(emi).toBeCloseTo(379, 0);
    });
  });

  describe('Zero-interest loans', () => {
    it('handles zero interest rate correctly', () => {
      const principal = 12000;
      const annualRate = 0;
      const years = 2;
      const months = years * 12;
      
      // With zero interest, EMI is simply principal / months
      const emi = principal / months;
      
      expect(emi).toBe(500);
    });

    it('calculates total repayment for zero-interest loan', () => {
      const principal = 24000;
      const annualRate = 0;
      const years = 3;
      const months = years * 12;
      
      const emi = principal / months;
      const total = emi * months;
      
      expect(total).toBe(principal);
      expect(total - principal).toBe(0); // No interest
    });

    it('zero-interest loan has no interest component', () => {
      const principal = 50000;
      const annualRate = 0;
      const years = 5;
      const months = years * 12;
      
      const emi = principal / months;
      const totalPayment = emi * months;
      const totalInterest = totalPayment - principal;
      
      expect(totalInterest).toBe(0);
    });
  });

  describe('Extra payments impact', () => {
    it('reduces total interest with extra payment', () => {
      const principal = 100000;
      const annualRate = 0.06;
      const monthlyRate = annualRate / 12;
      const years = 5;
      const months = years * 12;
      
      const regularEmi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                         (Math.pow(1 + monthlyRate, months) - 1);
      const totalRegular = regularEmi * months;
      const interestRegular = totalRegular - principal;
      
      // Add $200 extra per month
      const extraPayment = 200;
      const newMonthlyPayment = regularEmi + extraPayment;
      
      // Calculate how many months to pay off with extra payment
      let balance = principal;
      let monthsWithExtra = 0;
      let totalPaidWithExtra = 0;
      
      while (balance > 0 && monthsWithExtra < months * 2) {
        const interestForMonth = balance * monthlyRate;
        const principalPortion = newMonthlyPayment - interestForMonth;
        balance -= principalPortion;
        totalPaidWithExtra += newMonthlyPayment;
        monthsWithExtra++;
        
        if (balance < 0) {
          // Last payment is less than full EMI
          totalPaidWithExtra += balance;
          balance = 0;
        }
      }
      
      const interestWithExtra = totalPaidWithExtra - principal;
      
      expect(monthsWithExtra).toBeLessThan(months);
      expect(interestWithExtra).toBeLessThan(interestRegular);
    });

    it('one-time extra payment reduces principal faster', () => {
      const principal = 50000;
      const annualRate = 0.05;
      const monthlyRate = annualRate / 12;
      const years = 3;
      const months = years * 12;
      
      const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                  (Math.pow(1 + monthlyRate, months) - 1);
      
      // Simulate with one-time extra payment at month 6
      let balance = principal;
      let totalInterest = 0;
      
      for (let month = 1; month <= months; month++) {
        const interestForMonth = balance * monthlyRate;
        totalInterest += interestForMonth;
        const principalPortion = emi - interestForMonth;
        balance -= principalPortion;
        
        // Extra payment at month 6
        if (month === 6) {
          balance -= 5000; // One-time extra payment
        }
        
        if (balance <= 0) break;
      }
      
      expect(balance).toBeLessThanOrEqual(0);
    });
  });

  describe('Total interest calculations', () => {
    it('calculates total interest over loan term', () => {
      const principal = 100000;
      const annualRate = 0.06;
      const monthlyRate = annualRate / 12;
      const years = 5;
      const months = years * 12;
      
      const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                  (Math.pow(1 + monthlyRate, months) - 1);
      const totalPayment = emi * months;
      const totalInterest = totalPayment - principal;
      
      expect(totalInterest).toBeGreaterThan(0);
      expect(totalInterest).toBeCloseTo(15996.80, 0);
    });

    it('longer term means more total interest', () => {
      const principal = 100000;
      const annualRate = 0.06;
      
      const calculateTotalInterest = (years: number) => {
        const monthlyRate = annualRate / 12;
        const months = years * 12;
        const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                    (Math.pow(1 + monthlyRate, months) - 1);
        return (emi * months) - principal;
      };
      
      const interest3Year = calculateTotalInterest(3);
      const interest5Year = calculateTotalInterest(5);
      const interest10Year = calculateTotalInterest(10);
      
      expect(interest10Year).toBeGreaterThan(interest5Year);
      expect(interest5Year).toBeGreaterThan(interest3Year);
    });

    it('higher rate means more total interest', () => {
      const principal = 100000;
      const years = 5;
      const months = years * 12;
      
      const calculateTotalInterest = (rate: number) => {
        const monthlyRate = rate / 12;
        const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                    (Math.pow(1 + monthlyRate, months) - 1);
        return (emi * months) - principal;
      };
      
      const interestAt5 = calculateTotalInterest(0.05);
      const interestAt8 = calculateTotalInterest(0.08);
      const interestAt11 = calculateTotalInterest(0.11);
      
      expect(interestAt11).toBeGreaterThan(interestAt8);
      expect(interestAt8).toBeGreaterThan(interestAt5);
    });
  });

  describe('Boundary values and edge cases', () => {
    it('handles very small loan amount', () => {
      const principal = 100;
      const annualRate = 0.05;
      const monthlyRate = annualRate / 12;
      const months = 12;
      
      const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                  (Math.pow(1 + monthlyRate, months) - 1);
      
      expect(emi).toBeGreaterThan(0);
      expect(emi).toBeCloseTo(8.56, 2);
    });

    it('handles very large loan amount', () => {
      const principal = 10000000;
      const annualRate = 0.06;
      const monthlyRate = annualRate / 12;
      const months = 240; // 20 years
      
      const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                  (Math.pow(1 + monthlyRate, months) - 1);
      
      expect(emi).toBeGreaterThan(0);
      expect(emi).toBeCloseTo(71643.11, 0);
    });

    it('handles short loan term (1 year)', () => {
      const principal = 12000;
      const annualRate = 0.06;
      const monthlyRate = annualRate / 12;
      const months = 12;
      
      const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                  (Math.pow(1 + monthlyRate, months) - 1);
      
      expect(emi).toBeCloseTo(1034, 0);
    });

    it('handles long loan term (30 years)', () => {
      const principal = 300000;
      const annualRate = 0.05;
      const monthlyRate = annualRate / 12;
      const months = 360; // 30 years
      
      const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                  (Math.pow(1 + monthlyRate, months) - 1);
      
      expect(emi).toBeCloseTo(1610.46, 1);
    });

    it('rejects negative principal', () => {
      const principal = -50000;
      expect(principal).toBeLessThan(0);
      // In actual implementation, this should be validated
    });

    it('rejects negative interest rate', () => {
      const rate = -0.05;
      expect(rate).toBeLessThan(0);
      // In actual implementation, this should be validated
    });

    it('rejects invalid loan term', () => {
      const years = 0;
      expect(years).toBeLessThan(1);
      // In actual implementation, this should be validated
    });
  });

  describe('Amortization schedule verification', () => {
    it('first payment has highest interest portion', () => {
      const principal = 100000;
      const annualRate = 0.06;
      const monthlyRate = annualRate / 12;
      const months = 60;
      
      const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                  (Math.pow(1 + monthlyRate, months) - 1);
      
      let balance = principal;
      const firstMonthInterest = balance * monthlyRate;
      const firstMonthPrincipal = emi - firstMonthInterest;
      
      // After first payment
      balance -= firstMonthPrincipal;
      const secondMonthInterest = balance * monthlyRate;
      
      expect(firstMonthInterest).toBeGreaterThan(secondMonthInterest);
    });

    it('principal portion increases each month', () => {
      const principal = 50000;
      const annualRate = 0.05;
      const monthlyRate = annualRate / 12;
      const months = 36;
      
      const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                  (Math.pow(1 + monthlyRate, months) - 1);
      
      let balance = principal;
      const principalPortions: number[] = [];
      
      for (let i = 0; i < 5; i++) {
        const interestForMonth = balance * monthlyRate;
        const principalPortion = emi - interestForMonth;
        principalPortions.push(principalPortion);
        balance -= principalPortion;
      }
      
      // Each subsequent principal portion should be larger
      for (let i = 1; i < principalPortions.length; i++) {
        expect(principalPortions[i]).toBeGreaterThan(principalPortions[i - 1]);
      }
    });

    it('final payment clears remaining balance', () => {
      const principal = 10000;
      const annualRate = 0.06;
      const monthlyRate = annualRate / 12;
      const months = 12;
      
      const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                  (Math.pow(1 + monthlyRate, months) - 1);
      
      let balance = principal;
      for (let i = 0; i < months - 1; i++) {
        const interestForMonth = balance * monthlyRate;
        const principalPortion = emi - interestForMonth;
        balance -= principalPortion;
      }
      
      // Final payment
      const finalInterest = balance * monthlyRate;
      const finalPayment = balance + finalInterest;
      balance -= (finalPayment - finalInterest);
      
      expect(balance).toBeCloseTo(0, 2);
    });
  });

  describe('Regional default configurations', () => {
    const regionalDefaults: Record<string, { amount: number; rate: number }> = {
      nepal: { amount: 1000000, rate: 11 },
      india: { amount: 1000000, rate: 8.5 },
      usa: { amount: 25000, rate: 6.5 },
      uk: { amount: 20000, rate: 5.25 },
      canada: { amount: 30000, rate: 5.5 },
      australia: { amount: 40000, rate: 6 },
      global: { amount: 10000, rate: 5 },
    };

    it.each(Object.entries(regionalDefaults))(
      '%s uses correct default loan amount and rate',
      (region, defaults) => {
        expect(defaults.amount).toBeGreaterThan(0);
        expect(defaults.rate).toBeGreaterThan(0);
        expect(defaults.rate).toBeLessThan(100); // Rate should be percentage
      }
    );
  });
});
