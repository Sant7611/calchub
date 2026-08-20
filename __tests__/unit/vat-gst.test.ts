import { describe, it, expect } from 'vitest';

describe('VAT/GST Calculations', () => {
  describe('Basic VAT/GST calculation', () => {
    it('calculates VAT correctly for standard rate', () => {
      const subtotal = 1000;
      const vatRate = 0.2; // 20%
      const vatAmount = subtotal * vatRate;
      const total = subtotal + vatAmount;
      
      expect(vatAmount).toBe(200);
      expect(total).toBe(1200);
    });

    it('calculates GST for Australian rate (10%)', () => {
      const subtotal = 500;
      const gstRate = 0.1;
      const gstAmount = subtotal * gstRate;
      const total = subtotal + gstAmount;
      
      expect(gstAmount).toBe(50);
      expect(total).toBe(550);
    });

    it('calculates VAT for UK rate (20%)', () => {
      const subtotal = 250;
      const vatRate = 0.2;
      const vatAmount = subtotal * vatRate;
      
      expect(vatAmount).toBe(50);
    });

    it('calculates VAT for Nepal rate (13%)', () => {
      const subtotal = 10000;
      const vatRate = 0.13;
      const vatAmount = subtotal * vatRate;
      
      expect(vatAmount).toBe(1300);
    });

    it('calculates GST for India rate (18%)', () => {
      const subtotal = 5000;
      const gstRate = 0.18;
      const gstAmount = subtotal * gstRate;
      
      expect(gstAmount).toBe(900);
    });
  });

  describe('Invoice discount calculations', () => {
    it('applies discount before tax', () => {
      const subtotal = 1000;
      const discount = 100;
      const taxRate = 0.2;
      
      const taxableAmount = subtotal - discount;
      const taxAmount = taxableAmount * taxRate;
      const total = taxableAmount + taxAmount;
      
      expect(taxableAmount).toBe(900);
      expect(taxAmount).toBe(180);
      expect(total).toBe(1080);
    });

    it('handles discount equal to subtotal', () => {
      const subtotal = 500;
      const discount = 500;
      const taxRate = 0.15;
      
      const taxableAmount = Math.max(0, subtotal - discount);
      const taxAmount = taxableAmount * taxRate;
      const total = taxableAmount + taxAmount;
      
      expect(taxableAmount).toBe(0);
      expect(taxAmount).toBe(0);
      expect(total).toBe(0);
    });

    it('clamps negative taxable amount to zero when discount exceeds subtotal', () => {
      const subtotal = 300;
      const discount = 500;
      const taxRate = 0.1;
      
      const taxableAmount = Math.max(0, subtotal - discount);
      const taxAmount = taxableAmount * taxRate;
      
      expect(taxableAmount).toBe(0);
      expect(taxAmount).toBe(0);
    });

    it('calculates correct savings display', () => {
      const subtotal = 800;
      const discount = 150;
      const savings = discount;
      
      expect(savings).toBe(150);
      expect(subtotal - savings).toBe(650);
    });

    it('handles percentage-based discounts', () => {
      const subtotal = 1000;
      const discountPercent = 0.15; // 15%
      const discount = subtotal * discountPercent;
      const taxableAmount = subtotal - discount;
      const taxRate = 0.2;
      const taxAmount = taxableAmount * taxRate;
      
      expect(discount).toBe(150);
      expect(taxableAmount).toBe(850);
      expect(taxAmount).toBe(170);
    });
  });

  describe('Edge cases and boundary values', () => {
    it('handles zero subtotal', () => {
      const subtotal = 0;
      const taxRate = 0.2;
      const taxAmount = subtotal * taxRate;
      
      expect(taxAmount).toBe(0);
    });

    it('handles zero tax rate', () => {
      const subtotal = 1000;
      const taxRate = 0;
      const taxAmount = subtotal * taxRate;
      
      expect(taxAmount).toBe(0);
    });

    it('handles very small amounts', () => {
      const subtotal = 0.01;
      const taxRate = 0.2;
      const taxAmount = subtotal * taxRate;
      
      expect(taxAmount).toBeCloseTo(0.002, 3);
    });

    it('handles very large amounts', () => {
      const subtotal = 1000000;
      const taxRate = 0.15;
      const taxAmount = subtotal * taxRate;
      
      expect(taxAmount).toBe(150000);
    });

    it('handles fractional tax rates', () => {
      const subtotal = 1000;
      const taxRate = 0.125; // 12.5%
      const taxAmount = subtotal * taxRate;
      
      expect(taxAmount).toBe(125);
    });
  });

  describe('Regional VAT/GST variations', () => {
    const regionalRates: Record<string, number> = {
      usa: 0.07,      // Sales Tax (average)
      nepal: 0.13,    // VAT
      india: 0.18,    // GST
      uk: 0.2,        // VAT
      canada: 0.05,   // GST
      australia: 0.1, // GST
    };

    it.each(Object.entries(regionalRates))(
      'calculates %s tax at %i%% rate',
      (region, rate) => {
        const subtotal = 1000;
        const taxAmount = subtotal * rate;
        
        expect(taxAmount).toBe(subtotal * rate);
      }
    );

    it('produces different tax amounts for different regions', () => {
      const subtotal = 5000;
      
      const nepalTax = subtotal * regionalRates.nepal;
      const ukTax = subtotal * regionalRates.uk;
      const australiaTax = subtotal * regionalRates.australia;
      
      expect(nepalTax).toBe(650);
      expect(ukTax).toBe(1000);
      expect(australiaTax).toBe(500);
      
      expect(ukTax).toBeGreaterThan(nepalTax);
      expect(nepalTax).toBeGreaterThan(australiaTax);
    });
  });

  describe('Reverse calculations', () => {
    it('can extract pre-tax amount from total', () => {
      const total = 1200;
      const taxRate = 0.2;
      const preTax = total / (1 + taxRate);
      const extractedTax = total - preTax;
      
      expect(preTax).toBeCloseTo(1000, 0);
      expect(extractedTax).toBeCloseTo(200, 0);
    });

    it('can extract tax rate from amounts', () => {
      const preTax = 1000;
      const total = 1150;
      const calculatedRate = (total - preTax) / preTax;
      
      expect(calculatedRate).toBeCloseTo(0.15, 3);
    });
  });

  describe('Multiple item invoices', () => {
    it('sums multiple line items correctly', () => {
      const items = [
        { description: 'Item 1', amount: 100 },
        { description: 'Item 2', amount: 250 },
        { description: 'Item 3', amount: 150 },
      ];
      
      const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
      const taxRate = 0.2;
      const taxAmount = subtotal * taxRate;
      const total = subtotal + taxAmount;
      
      expect(subtotal).toBe(500);
      expect(taxAmount).toBe(100);
      expect(total).toBe(600);
    });

    it('applies discount to entire invoice', () => {
      const items = [100, 200, 300];
      const subtotal = items.reduce((a, b) => a + b, 0);
      const invoiceDiscount = 50;
      const taxRate = 0.15;
      
      const taxableAmount = subtotal - invoiceDiscount;
      const taxAmount = taxableAmount * taxRate;
      const total = taxableAmount + taxAmount;
      
      expect(subtotal).toBe(600);
      expect(taxableAmount).toBe(550);
      expect(taxAmount).toBe(82.5);
      expect(total).toBe(632.5);
    });
  });
});
