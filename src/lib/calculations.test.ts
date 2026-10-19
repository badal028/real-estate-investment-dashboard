import assert from "node:assert/strict";
import { test } from "node:test";
import {
  evaluateInvestment,
  grossYield,
  monthlyEmi,
  netYield,
  remainingBalance,
} from "./calculations";

const base = {
  purchasePrice: 1_000_000,
  monthlyRent: 10_000,
  expenseRatio: 0.25,
  occupancyRate: 1,
  downPaymentPercent: 50,
  closingCostPercent: 0,
  annualInterestRate: 0,
  loanYears: 10,
  appreciationRate: 0,
  rentGrowthRate: 0,
  holdingYears: 1,
};

test("gross yield is annual asking rent over price", () => {
  assert.equal(grossYield(1_00_00_000, 40_000), 4.8);
  assert.equal(grossYield(0, 40_000), 0);
});

test("net yield deducts vacancy and expenses", () => {
  assert.equal(netYield(1_000_000, 10_000, 1, 0.25), 9);
  assert.equal(netYield(1_000_000, 10_000, 0.5, 0), 6);
});

test("emi matches the amortising formula and a zero-rate loan", () => {
  assert.ok(Math.abs(monthlyEmi(100_000, 12, 1) - 8884.878) < 0.01);
  assert.equal(monthlyEmi(120_000, 0, 10), 1000);
  assert.equal(monthlyEmi(0, 8.5, 20), 0);
});

test("remaining balance declines linearly when interest is zero", () => {
  assert.equal(remainingBalance(100_000, 0, 10, 0), 100_000);
  assert.equal(remainingBalance(100_000, 0, 10, 60), 50_000);
  assert.equal(remainingBalance(100_000, 0, 10, 120), 0);
});

test("one-year zero-interest hold reconciles cash flow, equity, and IRR", () => {
  const result = evaluateInvestment(base);

  assert.equal(result.grossYield, 12);
  assert.equal(result.netYield, 9);
  assert.equal(result.netOperatingIncome, 90_000);
  assert.ok(Math.abs(result.monthlyEmi - 500_000 / 120) < 1e-6);
  assert.ok(Math.abs(result.annualDebtService - 50_000) < 0.01);
  assert.ok(Math.abs(result.annualCashFlow - 40_000) < 0.01);
  assert.ok(Math.abs((result.cashOnCash ?? 0) - 8) < 0.001);
  assert.ok(Math.abs(result.remainingLoan - 450_000) < 0.01);
  assert.equal(result.equityAtExit, 550_000);
  assert.ok(Math.abs(result.totalGain - 90_000) < 0.01);
  assert.ok(Math.abs((result.totalReturn ?? 0) - 18) < 0.001);
  assert.ok(Math.abs((result.irr ?? 0) - 18) < 0.05);
});

test("debt service stops after the loan term", () => {
  const result = evaluateInvestment({
    ...base,
    purchasePrice: 120_000,
    monthlyRent: 1_000,
    expenseRatio: 0,
    loanYears: 1,
    holdingYears: 2,
  });

  assert.equal(result.schedule[1]?.debtService, 0);
  assert.equal(result.remainingLoan, 0);
  assert.ok(Math.abs(result.totalGain - 24_000) < 0.01);
});

test("an all-cash purchase has no EMI", () => {
  const result = evaluateInvestment({
    ...base,
    expenseRatio: 0,
    downPaymentPercent: 100,
    closingCostPercent: 6,
    annualInterestRate: 8.5,
    loanYears: 20,
  });

  assert.equal(result.loanAmount, 0);
  assert.equal(result.monthlyEmi, 0);
  assert.equal(result.annualCashFlow, 120_000);
  assert.equal(result.cashInvested, 1_060_000);
  assert.ok(Math.abs((result.cashOnCash ?? 0) - (120_000 / 1_060_000) * 100) < 0.001);
});

test("a zero price does not divide by zero", () => {
  const result = evaluateInvestment({ ...base, purchasePrice: 0, downPaymentPercent: 20 });
  assert.equal(result.grossYield, 0);
  assert.equal(result.cashOnCash, null);
  assert.equal(result.irr, null);
});
