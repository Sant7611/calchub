"use client";

import { useState } from "react";
import { Field, NumInput, Stat, StatGrid } from "./shared";
import { useRegion } from "@/store/useRegionStore";
import { makeFormatters } from "@/lib/format";

/** Region-aware invoice calculator with VAT/GST/sales tax support. */
export function InvoiceCalculator() {
  const { region, config } = useRegion();
  const formatters = makeFormatters(region);
  
  const [subtotal, setSubtotal] = useState(1000);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(config.defaultSalesTaxRate * 100);
  
  // Clamp taxable subtotal to zero when discount exceeds subtotal
  const taxableSubtotal = Math.max(0, subtotal - discount);
  const taxAmount = taxableSubtotal * (taxRate / 100);
  const total = taxableSubtotal + taxAmount;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={`Subtotal (${config.currencyCode})`}>
          <NumInput value={subtotal} onChange={setSubtotal} prefix={config.currencySymbol} step={10} />
        </Field>
        <Field label={`Discount (${config.currencyCode})`} hint="Discount is subtracted before tax">
          <NumInput value={discount} onChange={setDiscount} prefix={config.currencySymbol} step={10} />
        </Field>
        <Field 
          label={`${config.salesTaxLabel} Rate (%)`}
          hint={`Default: ${(config.defaultSalesTaxRate * 100).toFixed(1)}% · ${config.isEstimate ? "Estimate" : "Verified"}`}
        >
          <NumInput value={taxRate} onChange={setTaxRate} suffix="%" step={0.1} min={0} max={100} />
        </Field>
        <div className="flex items-end">
          <div className="w-full rounded-lg border border-ink-600 bg-ink-850 px-3 py-2 font-mono text-[13px] text-fog-300">
            {config.isEstimate && config.estimateNote ? (
              <span className="text-amber-400">⚠️ Estimate</span>
            ) : (
              <span className="text-fog-500">{config.taxYear}</span>
            )}
          </div>
        </div>
      </div>

      <StatGrid>
        <Stat accent label="Total" value={formatters.money(total)} sub={`Taxable: ${formatters.money(taxableSubtotal)}`} />
        <Stat label={`${config.salesTaxLabel}`} value={formatters.money(taxAmount)} />
        <Stat label="After Discount" value={formatters.money(taxableSubtotal)} sub={discount > 0 ? `Saved: ${formatters.money(discount)}` : undefined} />
      </StatGrid>

      {discount > subtotal && (
        <p className="mt-3 text-[11.5px] text-amber-400">
          ⚠️ Discount exceeds subtotal — taxable amount clamped to zero.
        </p>
      )}

      <div className="mt-4 space-y-2">
        {config.isEstimate && config.estimateNote && (
          <p className="text-[11.5px] text-amber-400">
            ⚠️ <strong>Estimate:</strong> {config.estimateNote}
          </p>
        )}
        <p className="text-[11.5px] text-fog-600">
          Invoice calculations are estimates only. Actual {config.salesTaxLabel.toLowerCase()} rates may vary by jurisdiction, product type, or customer status.
          Consult a tax professional for compliance.
        </p>
      </div>
    </div>
  );
}
