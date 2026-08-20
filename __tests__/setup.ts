import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock region store with default values
const mockRegionStore = {
  region: 'global' as const,
  config: {
    name: 'Global (Illustrative)',
    currencyCode: 'USD',
    currencySymbol: '$',
    locale: 'en-US',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    defaultTaxLabel: 'Tax',
    defaultTaxRate: 0.2,
    standardWeeklyHours: 40,
    supportedPayFrequencies: [
      { value: 'monthly', label: 'Monthly', periodsPerYear: 12 },
    ],
    flag: '🌍',
    defaultInterestRate: 5,
    defaultLoanAmount: 10000,
    taxYear: 'Current Year (Illustrative)',
    taxBrackets: [{ limit: Infinity, rate: 0.2 }],
    toolName: 'Calculator',
    paymentLabel: 'Payment',
    defaultSalesTaxRate: 0,
    salesTaxLabel: 'Sales Tax',
    filingStatuses: [{ value: 'single', label: 'Single' }],
    payrollDeductions: [],
    isEstimate: true,
    propertyTaxLabel: 'Property Tax',
    insuranceLabel: 'Insurance',
    hoaLabel: 'HOA Fees',
    hasServiceCharge: false,
    serviceChargeLabel: 'Service Charge',
  },
  setRegion: vi.fn(),
};

vi.mock('@/store/useRegionStore', () => ({
  useRegion: () => mockRegionStore,
}));

// Provide a way to override the mock region in tests
export function setMockRegion(region: string, config: Record<string, unknown>) {
  mockRegionStore.region = region as typeof mockRegionStore.region;
  mockRegionStore.config = { ...mockRegionStore.config, ...config };
}
