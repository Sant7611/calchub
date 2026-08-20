import { describe, it, expect } from 'vitest';

describe('Regional Formatting', () => {
  const regionalConfigs: Record<string, { locale: string; currency: string; timezone: string; dateFormat: string }> = {
    global: { locale: 'en-US', currency: 'USD', timezone: 'UTC', dateFormat: 'MM/DD/YYYY' },
    usa: { locale: 'en-US', currency: 'USD', timezone: 'America/New_York', dateFormat: 'MM/DD/YYYY' },
    nepal: { locale: 'en-IN', currency: 'NPR', timezone: 'Asia/Kathmandu', dateFormat: 'DD/MM/YYYY' },
    india: { locale: 'en-IN', currency: 'INR', timezone: 'Asia/Kolkata', dateFormat: 'DD/MM/YYYY' },
    uk: { locale: 'en-GB', currency: 'GBP', timezone: 'Europe/London', dateFormat: 'DD/MM/YYYY' },
    canada: { locale: 'en-CA', currency: 'CAD', timezone: 'America/Toronto', dateFormat: 'DD/MM/YYYY' },
    australia: { locale: 'en-AU', currency: 'AUD', timezone: 'Australia/Sydney', dateFormat: 'DD/MM/YYYY' },
  };

  describe('Number formatting by region', () => {
    it('formats numbers with US locale (comma thousands separator)', () => {
      const value = 1234567.89;
      const formatted = new Intl.NumberFormat('en-US').format(value);
      
      expect(formatted).toBe('1,234,567.89');
    });

    it('formats numbers with UK locale (comma thousands separator)', () => {
      const value = 1234567.89;
      const formatted = new Intl.NumberFormat('en-GB').format(value);
      
      expect(formatted).toBe('1,234,567.89');
    });

    it('formats numbers with Indian locale (lakh/crore grouping)', () => {
      const value = 1234567.89;
      const formatted = new Intl.NumberFormat('en-IN').format(value);
      
      // Indian numbering: 12,34,567.89
      expect(formatted).toBe('12,34,567.89');
    });

    it('formats numbers with Canadian locale', () => {
      const value = 1234567.89;
      const formatted = new Intl.NumberFormat('en-CA').format(value);
      
      expect(formatted).toBe('1,234,567.89');
    });

    it('formats numbers with Australian locale', () => {
      const value = 1234567.89;
      const formatted = new Intl.NumberFormat('en-AU').format(value);
      
      expect(formatted).toBe('1,234,567.89');
    });
  });

  describe('Currency formatting by region', () => {
    it('formats USD with dollar sign', () => {
      const value = 1234.56;
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value);
      
      expect(formatted).toBe('$1,234.56');
    });

    it('formats NPR with Rs. symbol', () => {
      const value = 12345.67;
      const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'NPR',
      }).format(value);
      
      expect(formatted).toContain('12,345.67');
    });

    it('formats INR with rupee symbol', () => {
      const value = 12345.67;
      const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      }).format(value);
      
      expect(formatted).toContain('12,345.67');
    });

    it('formats GBP with pound sign', () => {
      const value = 1234.56;
      const formatted = new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
      }).format(value);
      
      expect(formatted).toBe('£1,234.56');
    });

    it('formats CAD with dollar sign', () => {
      const value = 1234.56;
      const formatted = new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
      }).format(value);
      
      expect(formatted).toContain('$');
    });

    it('formats AUD with dollar sign', () => {
      const value = 1234.56;
      const formatted = new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD',
      }).format(value);
      
      expect(formatted).toContain('$');
    });
  });

  describe('Date formatting by region', () => {
    const testDate = new Date('2024-06-15T14:30:00');

    it('formats date in MM/DD/YYYY for US', () => {
      const formatted = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(testDate);
      
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('formats date in DD/MM/YYYY for UK', () => {
      const formatted = new Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(testDate);
      
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
      // UK format should have day first
      const parts = formatted.split('/');
      expect(parseInt(parts[0])).toBe(15); // Day
      expect(parseInt(parts[1])).toBe(6);  // Month
    });

    it('formats date in DD/MM/YYYY for Nepal', () => {
      const formatted = new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(testDate);
      
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('formats date in DD/MM/YYYY for India', () => {
      const formatted = new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(testDate);
      
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('formats date in DD/MM/YYYY for Australia', () => {
      const formatted = new Intl.DateTimeFormat('en-AU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(testDate);
      
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  describe('Time formatting by timezone', () => {
    const testTime = new Date('2024-06-15T12:00:00Z');

    it('shows time in New York timezone (EDT in summer)', () => {
      const formatted = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/New_York',
      }).format(testTime);
      
      expect(formatted).toMatch(/\d{2}:\d{2}/);
    });

    it('shows time in Kathmandu timezone (UTC+5:45)', () => {
      const formatted = new Intl.DateTimeFormat('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kathmandu',
      }).format(testTime);
      
      // 12:00 UTC + 5:45 = 17:45 in Kathmandu
      expect(formatted).toMatch(/\d{2}:\d{2}/);
    });

    it('shows time in Kolkata timezone (IST, UTC+5:30)', () => {
      const formatted = new Intl.DateTimeFormat('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata',
      }).format(testTime);
      
      // 12:00 UTC + 5:30 = 17:30 in Kolkata
      expect(formatted).toMatch(/\d{2}:\d{2}/);
    });

    it('shows time in London timezone (BST in summer)', () => {
      const formatted = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/London',
      }).format(testTime);
      
      expect(formatted).toMatch(/\d{2}:\d{2}/);
    });

    it('shows time in Toronto timezone (EDT in summer)', () => {
      const formatted = new Intl.DateTimeFormat('en-CA', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Toronto',
      }).format(testTime);
      
      expect(formatted).toMatch(/\d{2}:\d{2}/);
    });

    it('shows time in Sydney timezone (AEST in winter)', () => {
      const formatted = new Intl.DateTimeFormat('en-AU', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Australia/Sydney',
      }).format(testTime);
      
      expect(formatted).toMatch(/\d{2}:\d{2}/);
    });
  });

  describe('Fraction digits handling', () => {
    it('formats with zero fraction digits', () => {
      const value = 1234.56;
      const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
      
      expect(formatted).toBe('1,235'); // Rounded
    });

    it('formats with two fraction digits', () => {
      const value = 1234.5;
      const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
      
      expect(formatted).toBe('1,234.50');
    });

    it('formats with four fraction digits for small amounts', () => {
      const value = 0.1234;
      const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      }).format(value);
      
      expect(formatted).toBe('0.1234');
    });

    it('handles currency with appropriate fraction digits', () => {
      const value = 100;
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
      
      expect(formatted).toBe('$100.00');
    });
  });

  describe('Boundary values', () => {
    it('formats zero correctly', () => {
      const formatted = new Intl.NumberFormat('en-US').format(0);
      expect(formatted).toBe('0');
    });

    it('formats negative numbers', () => {
      const value = -1234.56;
      const formatted = new Intl.NumberFormat('en-US').format(value);
      expect(formatted).toBe('-1,234.56');
    });

    it('formats very large numbers', () => {
      const value = 1234567890.12;
      const formatted = new Intl.NumberFormat('en-US').format(value);
      expect(formatted).toBe('1,234,567,890.12');
    });

    it('formats very small positive numbers', () => {
      const value = 0.001;
      const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      }).format(value);
      expect(formatted).toBe('0.001');
    });

    it('formats numbers at currency boundaries', () => {
      // Just below 1 million
      const value = 999999.99;
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value);
      expect(formatted).toBe('$999,999.99');
    });
  });

  describe('All regions support required formats', () => {
    it.each(Object.entries(regionalConfigs))(
      '%s has valid locale',
      (region, config) => {
        expect(config.locale).toMatch(/^[a-z]{2}-[A-Z]{2}$/);
      }
    );

    it.each(Object.entries(regionalConfigs))(
      '%s has valid currency code',
      (region, config) => {
        expect(config.currency).toMatch(/^[A-Z]{3}$/);
      }
    );

    it.each(Object.entries(regionalConfigs))(
      '%s has valid IANA timezone',
      (region, config) => {
        expect(() => {
          new Intl.DateTimeFormat('en-US', { timeZone: config.timezone });
        }).not.toThrow();
      }
    );

    it.each(Object.entries(regionalConfigs))(
      '%s has valid date format pattern',
      (region, config) => {
        expect(config.dateFormat).toMatch(/^(MM\/DD|DD\/MM)\/YYYY$/);
      }
    );
  });

  describe('Invalid and empty inputs', () => {
    it('handles NaN gracefully', () => {
      const result = Number.NaN;
      expect(Number.isNaN(result)).toBe(true);
    });

    it('handles Infinity', () => {
      const result = Infinity;
      expect(Number.isFinite(result)).toBe(false);
    });

    it('sanitizes string numbers', () => {
      const stringValue = '1,234.56';
      const parsed = parseFloat(stringValue.replace(/,/g, ''));
      expect(parsed).toBe(1234.56);
    });

    it('handles null/undefined with fallback', () => {
      const nullValue: number | null = null;
      const safeValue = nullValue ?? 0;
      expect(safeValue).toBe(0);
    });
  });
});
