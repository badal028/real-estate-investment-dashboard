"use client";

import { useState } from "react";
import {
  DEFAULT_FINANCING,
  evaluateInvestment,
  type InvestmentInput,
  type InvestmentResult,
  type YearCashFlow,
} from "@/lib/calculations";
import { formatCompactINR, formatINR, formatPercent } from "@/lib/format";
import { CITY_ORDER, getProperty, properties } from "@/lib/properties";
import type { Property } from "@/lib/types";

type CalculatorForm = {
  purchasePrice: number;
  monthlyRent: number;
  expensePercent: number;
  occupancyPercent: number;
  downPaymentPercent: number;
  closingCostPercent: number;
  annualInterestRate: number;
  loanYears: number;
  appreciationRate: number;
  rentGrowthRate: number;
  holdingYears: number;
};

const controlClass =
  "h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink num outline-none focus:border-forest";

const chipClass = "rounded-full border border-line bg-paper px-3 py-1.5 text-sm text-ink hover:border-forest";

function formFromProperty(property: Property): CalculatorForm {
  return {
    purchasePrice: property.price,
    monthlyRent: property.monthlyRent,
    expensePercent: property.expenseRatio * 100,
    occupancyPercent: property.occupancyRate * 100,
    downPaymentPercent: DEFAULT_FINANCING.downPaymentPercent,
    closingCostPercent: DEFAULT_FINANCING.closingCostPercent,
    annualInterestRate: DEFAULT_FINANCING.annualInterestRate,
    loanYears: DEFAULT_FINANCING.loanYears,
    appreciationRate: property.assumedAppreciation,
    rentGrowthRate: DEFAULT_FINANCING.rentGrowthRate,
    holdingYears: DEFAULT_FINANCING.holdingYears,
  };
}

function toInput(form: CalculatorForm): InvestmentInput {
  return {
    purchasePrice: form.purchasePrice,
    monthlyRent: form.monthlyRent,
    expenseRatio: form.expensePercent / 100,
    occupancyRate: form.occupancyPercent / 100,
    downPaymentPercent: form.downPaymentPercent,
    closingCostPercent: form.closingCostPercent,
    annualInterestRate: form.annualInterestRate,
    loanYears: form.loanYears,
    appreciationRate: form.appreciationRate,
    rentGrowthRate: form.rentGrowthRate,
    holdingYears: form.holdingYears,
  };
}

function readNumber(raw: string, min: number, max: number): number {
  if (raw.trim() === "") return min;
  const value = Number(raw);
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function cityRank(city: string) {
  const index = CITY_ORDER.indexOf(city as (typeof CITY_ORDER)[number]);
  return index === -1 ? CITY_ORDER.length : index;
}

export function InvestmentCalculator({
  propertyId,
  allowPropertyChange = false,
}: {
  propertyId: string;
  allowPropertyChange?: boolean;
}) {
  const initial = getProperty(propertyId) ?? properties[0];
  const [sourceId, setSourceId] = useState(initial?.id ?? propertyId);
  const source = getProperty(sourceId) ?? initial;
  const [form, setForm] = useState<CalculatorForm | null>(source ? formFromProperty(source) : null);

  if (!source || !form) return null;

  const result = evaluateInvestment(toInput(form));
  const pickerList = [...properties].sort((a, b) => cityRank(a.city) - cityRank(b.city) || a.name.localeCompare(b.name));

  function update(patch: Partial<CalculatorForm>) {
    setForm((current) => (current ? { ...current, ...patch } : current));
  }

  function loadProperty(id: string) {
    const next = getProperty(id);
    if (!next) return;
    setSourceId(id);
    setForm(formFromProperty(next));
  }

  const loanPreset =
    form.downPaymentPercent === DEFAULT_FINANCING.downPaymentPercent &&
    form.annualInterestRate === DEFAULT_FINANCING.annualInterestRate &&
    form.loanYears === DEFAULT_FINANCING.loanYears;

  return (
    <div>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          {allowPropertyChange ? (
            <label className="block">
              <span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-muted">
                Prefill from a sample listing
              </span>
              <select
                value={sourceId}
                onChange={(event) => loadProperty(event.target.value)}
                className={controlClass}
              >
                {pickerList.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name} · {property.city}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={loanPreset}
              onClick={() =>
                update({
                  downPaymentPercent: DEFAULT_FINANCING.downPaymentPercent,
                  annualInterestRate: DEFAULT_FINANCING.annualInterestRate,
                  loanYears: DEFAULT_FINANCING.loanYears,
                })
              }
              className={chipClass}
            >
              20% down
            </button>
            <button
              type="button"
              aria-pressed={form.downPaymentPercent === 100}
              onClick={() => update({ downPaymentPercent: 100 })}
              className={chipClass}
            >
              All cash
            </button>
            <button type="button" onClick={() => setForm(formFromProperty(source))} className={chipClass}>
              Reset
            </button>
          </div>

          <section className="rounded-lg border border-line bg-card p-5">
            <h3 className="text-[11px] uppercase tracking-[0.16em] text-brass">Income</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <NumberField
                label="Monthly rent"
                value={form.monthlyRent}
                min={0}
                max={5_000_000}
                step={1}
                hint={formatINR(form.monthlyRent)}
                onChange={(monthlyRent) => update({ monthlyRent })}
              />
              <NumberField
                label="Occupancy"
                value={form.occupancyPercent}
                min={0}
                max={100}
                step={1}
                suffix="%"
                hint="Share of the year rented"
                onChange={(occupancyPercent) => update({ occupancyPercent })}
              />
              <NumberField
                label="Expense ratio"
                value={form.expensePercent}
                min={0}
                max={80}
                step={1}
                suffix="% of collected rent"
                hint="Tax, maintenance, insurance, management"
                onChange={(expensePercent) => update({ expensePercent })}
              />
            </div>
          </section>

          <section className="rounded-lg border border-line bg-card p-5">
            <h3 className="text-[11px] uppercase tracking-[0.16em] text-brass">Purchase</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <NumberField
                label="Purchase price"
                value={form.purchasePrice}
                min={0}
                max={1_000_000_000}
                step={1}
                hint={formatINR(form.purchasePrice)}
                onChange={(purchasePrice) => update({ purchasePrice })}
              />
              <NumberField
                label="Down payment"
                value={form.downPaymentPercent}
                min={0}
                max={100}
                step={1}
                suffix="%"
                onChange={(downPaymentPercent) => update({ downPaymentPercent })}
              />
              <NumberField
                label="Closing costs"
                value={form.closingCostPercent}
                min={0}
                max={20}
                step={0.5}
                suffix="% of price"
                hint="Stamp duty, registration, brokerage"
                onChange={(closingCostPercent) => update({ closingCostPercent })}
              />
            </div>
          </section>

          <section className="rounded-lg border border-line bg-card p-5">
            <h3 className="text-[11px] uppercase tracking-[0.16em] text-brass">Loan</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <NumberField
                label="Interest rate"
                value={form.annualInterestRate}
                min={0}
                max={20}
                step={0.1}
                suffix="% a year"
                onChange={(annualInterestRate) => update({ annualInterestRate })}
              />
              <NumberField
                label="Loan term"
                value={form.loanYears}
                min={1}
                max={30}
                step={1}
                suffix="years"
                onChange={(loanYears) => update({ loanYears: Math.round(loanYears) })}
              />
            </div>
          </section>

          <section className="rounded-lg border border-line bg-card p-5">
            <h3 className="text-[11px] uppercase tracking-[0.16em] text-brass">Projection</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <NumberField
                label="Price growth"
                value={form.appreciationRate}
                min={-10}
                max={20}
                step={0.5}
                suffix="% a year"
                hint="Forward assumption, not the historical change"
                onChange={(appreciationRate) => update({ appreciationRate })}
              />
              <NumberField
                label="Rent growth"
                value={form.rentGrowthRate}
                min={0}
                max={15}
                step={0.5}
                suffix="% a year"
                onChange={(rentGrowthRate) => update({ rentGrowthRate })}
              />
              <label className="block sm:col-span-2">
                <span className="mb-1.5 flex items-baseline justify-between text-sm">
                  <span>Holding period</span>
                  <span className="num text-muted">{form.holdingYears} years</span>
                </span>
                <input
                  type="range"
                  min={1}
                  max={30}
                  step={1}
                  value={form.holdingYears}
                  onChange={(event) => update({ holdingYears: Number(event.target.value) })}
                  className="w-full accent-forest"
                />
              </label>
            </div>
          </section>

          <details className="rounded-lg border border-line bg-card px-5 py-4 text-sm leading-6 text-muted">
            <summary className="cursor-pointer font-medium text-ink">How the figures are calculated</summary>
            <div className="mt-3 space-y-2">
              <p>Gross yield is annual asking rent divided by price. It ignores vacancy.</p>
              <p>
                Net yield is NOI divided by price. NOI is asking rent × 12 × occupancy × (1 − expense ratio).
              </p>
              <p>
                EMI is the standard amortising payment. Year-1 cash flow is NOI minus EMI × 12. Cash-on-cash
                divides that cash flow by the down payment plus closing costs.
              </p>
              <p>
                Collected rent then grows at the rent growth rate. Occupancy stays constant. Debt service
                stops after the loan term. Property value compounds at the price growth rate.
              </p>
              <p>
                Exit equity is the future value minus the remaining loan balance. Total gain adds the cash
                flows to that equity and subtracts cash invested. IRR is the annual rate that sets the net
                present value of those cash flows to zero.
              </p>
            </div>
          </details>
        </div>

        <ResultPanel result={result} holdingYears={form.holdingYears} />
      </div>
      <CashFlowTable rows={result.schedule} />
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  step,
  suffix,
  hint,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  hint?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
        <span>{label}</span>
        {suffix ? <span className="text-xs text-muted">{suffix}</span> : null}
      </span>
      <input
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(value) ? value : min}
        onChange={(event) => onChange(readNumber(event.target.value, min, max))}
        className={controlClass}
      />
      {hint ? <span className="mt-1 block text-xs leading-5 text-muted">{hint}</span> : null}
    </label>
  );
}

function ResultPanel({ result, holdingYears }: { result: InvestmentResult; holdingYears: number }) {
  return (
    <aside className="rounded-lg bg-forest p-5 text-[#f6f1e6] lg:sticky lg:top-6">
      <p className="text-[11px] uppercase tracking-[0.16em] text-[#d9c7a6]">Sample results</p>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <Headline label="Gross yield" value={formatPercent(result.grossYield)} />
        <Headline label="Net yield" value={formatPercent(result.netYield)} />
        <Headline
          label="Cash-on-cash"
          value={result.cashOnCash === null ? "—" : formatPercent(result.cashOnCash)}
          negative={result.cashOnCash !== null && result.cashOnCash < 0}
        />
        <Headline
          label="IRR"
          value={result.irr === null ? "—" : formatPercent(result.irr)}
          negative={result.irr !== null && result.irr < 0}
        />
      </div>
      {result.annualCashFlow < 0 && result.loanAmount > 0 ? (
        <p className="mt-4 text-xs leading-5 text-[#f0b4a8]">
          Year-1 cash flow is negative. At these terms the loan costs more than the net rent.
        </p>
      ) : null}

      <Group title="First year">
        <Line label="Rent collected" value={formatCompactINR(result.effectiveAnnualRent)} />
        <Line label="Operating expenses" value={formatCompactINR(result.annualExpenses)} />
        <Line label="NOI" value={formatCompactINR(result.netOperatingIncome)} amount={result.netOperatingIncome} />
        <Line label="EMI" value={formatINR(result.monthlyEmi)} />
        <Line label="Cash flow" value={formatCompactINR(result.annualCashFlow)} amount={result.annualCashFlow} />
      </Group>
      <Group title="Capital">
        <Line label="Down payment" value={formatCompactINR(result.downPayment)} />
        <Line label="Closing costs" value={formatCompactINR(result.closingCosts)} />
        <Line label="Cash invested" value={formatCompactINR(result.cashInvested)} />
        <Line label="Loan amount" value={formatCompactINR(result.loanAmount)} />
      </Group>
      <Group title={`Exit, year ${holdingYears}`}>
        <Line label="Property value" value={formatCompactINR(result.futureValue)} />
        <Line label="Loan balance" value={formatCompactINR(result.remainingLoan)} />
        <Line label="Equity" value={formatCompactINR(result.equityAtExit)} amount={result.equityAtExit} />
        <Line
          label="Cumulative cash flow"
          value={formatCompactINR(result.cumulativeCashFlow)}
          amount={result.cumulativeCashFlow}
        />
        <Line label="Total gain" value={formatCompactINR(result.totalGain)} amount={result.totalGain} />
        <Line
          label="Simple total return"
          value={result.totalReturn === null ? "—" : formatPercent(result.totalReturn)}
          amount={result.totalReturn ?? undefined}
        />
      </Group>
    </aside>
  );
}

function Headline({ label, value, negative = false }: { label: string; value: string; negative?: boolean }) {
  return (
    <div>
      <p className="text-xs text-[#d7d0c4]">{label}</p>
      <p className={`num mt-1 font-serif text-3xl tracking-tight ${negative ? "text-[#f0b4a8]" : ""}`}>{value}</p>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 border-t border-white/15 pt-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-[#d9c7a6]">{title}</p>
      <dl className="mt-1">{children}</dl>
    </div>
  );
}

function Line({ label, value, amount }: { label: string; value: string; amount?: number }) {
  const negative = typeof amount === "number" && amount < 0;
  return (
    <div className="flex items-baseline justify-between gap-4 py-1 text-sm">
      <dt className="text-[#d7d0c4]">{label}</dt>
      <dd className={`num ${negative ? "text-[#f0b4a8]" : ""}`} title={value}>
        {value}
      </dd>
    </div>
  );
}

function CashFlowTable({ rows }: { rows: YearCashFlow[] }) {
  return (
    <section className="mt-6 rounded-lg border border-line bg-card p-4 sm:p-5">
      <h3 className="font-serif text-2xl tracking-tight">Year by year</h3>
      <p className="mt-1 text-sm text-muted">
        Rent collected already applies occupancy. It grows annually. Debt service is twelve EMIs in each year of the loan term.
      </p>
      <div className="mt-4 max-h-96 overflow-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="sticky top-0 bg-card text-left text-[11px] uppercase tracking-[0.14em] text-muted">
            <tr>
              <th className="py-2 pr-4 font-medium">Year</th>
              <th className="py-2 pr-4 text-right font-medium">Rent collected</th>
              <th className="py-2 pr-4 text-right font-medium">Expenses</th>
              <th className="py-2 pr-4 text-right font-medium">Debt service</th>
              <th className="py-2 text-right font-medium">Cash flow</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.year} className="border-t border-line/80">
                <th className="py-2 pr-4 text-left font-medium">{row.year}</th>
                <td className="num py-2 pr-4 text-right">{formatINR(row.rentCollected)}</td>
                <td className="num py-2 pr-4 text-right">{formatINR(row.expenses)}</td>
                <td className="num py-2 pr-4 text-right">{formatINR(row.debtService)}</td>
                <td className={`num py-2 text-right ${row.cashFlow < 0 ? "text-down" : ""}`}>
                  {formatINR(row.cashFlow)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
