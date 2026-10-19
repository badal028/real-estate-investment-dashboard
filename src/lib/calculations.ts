/**
 * Listing yield and a hold-period return.
 *
 * Gross yield uses asking rent and ignores vacancy.
 * Net yield and cash flow use occupancy and the expense ratio.
 * The loan is a standard monthly amortising loan.
 * IRR discounts the operating cash flows and exit equity
 * (future value minus the remaining loan balance).
 */

export type InvestmentInput = {
  purchasePrice: number;
  monthlyRent: number;
  expenseRatio: number;
  occupancyRate: number;
  downPaymentPercent: number;
  closingCostPercent: number;
  annualInterestRate: number;
  loanYears: number;
  appreciationRate: number;
  rentGrowthRate: number;
  holdingYears: number;
};

export type YearCashFlow = {
  year: number;
  rentCollected: number;
  expenses: number;
  debtService: number;
  cashFlow: number;
};

export type InvestmentResult = {
  grossYield: number;
  netYield: number;
  effectiveAnnualRent: number;
  annualExpenses: number;
  netOperatingIncome: number;
  downPayment: number;
  closingCosts: number;
  cashInvested: number;
  loanAmount: number;
  monthlyEmi: number;
  annualDebtService: number;
  annualCashFlow: number;
  cashOnCash: number | null;
  schedule: YearCashFlow[];
  cumulativeCashFlow: number;
  futureValue: number;
  remainingLoan: number;
  equityAtExit: number;
  totalGain: number;
  totalReturn: number | null;
  irr: number | null;
};

/** Shared loan assumptions for comparison and the calculator preset. */
export const DEFAULT_FINANCING = {
  downPaymentPercent: 20,
  closingCostPercent: 6,
  annualInterestRate: 8.5,
  loanYears: 20,
  rentGrowthRate: 3,
  holdingYears: 5,
} as const;

function finite(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, finite(value, min)));
}

/** Asking-rent yield. Vacancy and expenses are ignored. */
export function grossYield(price: number, monthlyRent: number): number {
  if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(monthlyRent) || monthlyRent <= 0) {
    return 0;
  }
  return ((monthlyRent * 12) / price) * 100;
}

export function netOperatingIncome(
  monthlyRent: number,
  occupancyRate: number,
  expenseRatio: number,
): number {
  const collected = Math.max(finite(monthlyRent), 0) * 12 * clamp(occupancyRate, 0, 1);
  return collected * (1 - clamp(expenseRatio, 0, 0.8));
}

export function netYield(
  price: number,
  monthlyRent: number,
  occupancyRate: number,
  expenseRatio: number,
): number {
  if (!Number.isFinite(price) || price <= 0) return 0;
  return (netOperatingIncome(monthlyRent, occupancyRate, expenseRatio) / price) * 100;
}

/** Standard amortising EMI. A zero rate spreads the principal evenly. */
export function monthlyEmi(principal: number, annualInterestRate: number, years: number): number {
  const loan = Math.max(finite(principal), 0);
  const months = Math.round(finite(years) * 12);
  if (loan <= 0 || months <= 0) return 0;
  const monthlyRate = Math.max(finite(annualInterestRate), 0) / 100 / 12;
  if (monthlyRate === 0) return loan / months;
  const growth = (1 + monthlyRate) ** months;
  return (loan * monthlyRate * growth) / (growth - 1);
}

export function remainingBalance(
  principal: number,
  annualInterestRate: number,
  years: number,
  paymentsMade: number,
): number {
  const loan = Math.max(finite(principal), 0);
  const months = Math.round(finite(years) * 12);
  const paid = Math.min(Math.max(Math.round(finite(paymentsMade)), 0), Math.max(months, 0));
  if (loan <= 0 || months <= 0 || paid >= months) return 0;
  const monthlyRate = Math.max(finite(annualInterestRate), 0) / 100 / 12;
  if (monthlyRate === 0) return loan * (1 - paid / months);
  const growthN = (1 + monthlyRate) ** months;
  const growthP = (1 + monthlyRate) ** paid;
  return (loan * (growthN - growthP)) / (growthN - 1);
}

function irr(cashFlows: number[]): number | null {
  if (cashFlows.length < 2) return null;
  if (!cashFlows.some((value) => value > 0) || !cashFlows.some((value) => value < 0)) return null;

  const solve = (start: number): number | null => {
    let rate = start;
    for (let attempt = 0; attempt < 80; attempt += 1) {
      let npv = 0;
      let derivative = 0;
      for (let period = 0; period < cashFlows.length; period += 1) {
        const discount = (1 + rate) ** period;
        if (!Number.isFinite(discount) || discount === 0) return null;
        npv += cashFlows[period] / discount;
        if (period > 0) {
          derivative -= (period * cashFlows[period]) / (1 + rate) ** (period + 1);
        }
      }
      const scale = Math.max(1, Math.abs(cashFlows[0]));
      if (Math.abs(npv) <= scale * 1e-8) return rate * 100;
      if (!Number.isFinite(derivative) || derivative === 0) return null;
      const next = rate - npv / derivative;
      if (!Number.isFinite(next) || next <= -0.99 || next > 10) return null;
      if (Math.abs(next - rate) < 1e-10) return next * 100;
      rate = next;
    }
    return null;
  };

  return solve(0.1) ?? solve(0) ?? solve(-0.2);
}

export function evaluateInvestment(input: InvestmentInput): InvestmentResult {
  const purchasePrice = clamp(input.purchasePrice, 0, 1_000_000_000);
  const monthlyRent = clamp(input.monthlyRent, 0, 5_000_000);
  const expenseRatio = clamp(input.expenseRatio, 0, 0.8);
  const occupancyRate = clamp(input.occupancyRate, 0, 1);
  const downPaymentPercent = clamp(input.downPaymentPercent, 0, 100);
  const closingCostPercent = clamp(input.closingCostPercent, 0, 20);
  const annualInterestRate = clamp(input.annualInterestRate, 0, 20);
  const loanYears = Math.round(clamp(input.loanYears, 1, 30));
  const appreciationRate = clamp(input.appreciationRate, -10, 20);
  const rentGrowthRate = clamp(input.rentGrowthRate, 0, 15);
  const holdingYears = Math.round(clamp(input.holdingYears, 1, 30));

  const effectiveAnnualRent = monthlyRent * 12 * occupancyRate;
  const annualExpenses = effectiveAnnualRent * expenseRatio;
  const netOperatingIncome = effectiveAnnualRent - annualExpenses;
  const downPayment = purchasePrice * (downPaymentPercent / 100);
  const closingCosts = purchasePrice * (closingCostPercent / 100);
  const cashInvested = downPayment + closingCosts;
  const loanAmount = Math.max(purchasePrice - downPayment, 0);
  const monthlyPayment = monthlyEmi(loanAmount, annualInterestRate, loanYears);
  const annualDebtService = monthlyPayment * 12;
  const annualCashFlow = netOperatingIncome - annualDebtService;

  const schedule: YearCashFlow[] = [];
  let rentCollected = effectiveAnnualRent;
  for (let year = 1; year <= holdingYears; year += 1) {
    const expenses = rentCollected * expenseRatio;
    const debtService = year <= loanYears ? annualDebtService : 0;
    schedule.push({
      year,
      rentCollected,
      expenses,
      debtService,
      cashFlow: rentCollected - expenses - debtService,
    });
    rentCollected *= 1 + rentGrowthRate / 100;
  }

  const cumulativeCashFlow = schedule.reduce((sum, row) => sum + row.cashFlow, 0);
  const futureValue = purchasePrice * (1 + appreciationRate / 100) ** holdingYears;
  const loanLeft = remainingBalance(loanAmount, annualInterestRate, loanYears, holdingYears * 12);
  const equityAtExit = futureValue - loanLeft;
  const totalGain = cumulativeCashFlow + equityAtExit - cashInvested;

  const cashFlows = [-cashInvested, ...schedule.map((row) => row.cashFlow)];
  cashFlows[cashFlows.length - 1] += equityAtExit;

  return {
    grossYield: grossYield(purchasePrice, monthlyRent),
    netYield: purchasePrice > 0 ? (netOperatingIncome / purchasePrice) * 100 : 0,
    effectiveAnnualRent,
    annualExpenses,
    netOperatingIncome,
    downPayment,
    closingCosts,
    cashInvested,
    loanAmount,
    monthlyEmi: monthlyPayment,
    annualDebtService,
    annualCashFlow,
    cashOnCash: cashInvested > 0 ? (annualCashFlow / cashInvested) * 100 : null,
    schedule,
    cumulativeCashFlow,
    futureValue,
    remainingLoan: loanLeft,
    equityAtExit,
    totalGain,
    totalReturn: cashInvested > 0 ? (totalGain / cashInvested) * 100 : null,
    irr: cashInvested > 0 ? irr(cashFlows) : null,
  };
}
