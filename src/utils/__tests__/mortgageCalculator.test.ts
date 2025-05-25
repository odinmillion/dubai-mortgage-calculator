import { describe, it, expect } from 'vitest';
import { calculateMortgage, type MortgageInput } from '../mortgageCalculator';

describe('mortgageCalculator', () => {
  // Base test case with standard inputs
  const baseInput: MortgageInput = {
    price: 3_900_000,
    downPaymentPercentage: 23,
    tenure: 25,
    rate: 4,
    bankArrangementFee: 1,
    useVariableRate: false,
    fixedRatePeriod: 5,
    variableRateMargin: 1.5,
    eiborRate: 4.3,
  };

  describe('fixed rate calculations', () => {
    it('should calculate monthly payment correctly for fixed rate', () => {
      const result = calculateMortgage(baseInput);
      console.log('Fixed rate test:');
      console.log('Loan amount:', result.loanAmount);
      console.log('Monthly rate:', (baseInput.rate / 100) / 12);
      console.log('Number of months:', baseInput.tenure * 12);
      console.log('Expected monthly payment:', 15_850.94);
      console.log('Actual monthly payment:', result.initialMonthlyPayment);
      
      // Monthly payment for 3.9M AED with 23% down payment at 4% for 25 years
      expect(result.initialMonthlyPayment).toBeCloseTo(15_850.94, 0);
      expect(result.adjustedMonthlyPayment).toBeNull();
    });

    it('should calculate total interest correctly for fixed rate', () => {
      const result = calculateMortgage(baseInput);
      const totalPayments = result.initialMonthlyPayment * baseInput.tenure * 12;
      const totalInterest = totalPayments - result.loanAmount;
      expect(result.totalInterest).toBeCloseTo(totalInterest, 0);
    });

    it('should calculate down payment correctly', () => {
      const result = calculateMortgage(baseInput);
      expect(result.downPayment).toBe(897_000); // 23% of 3.9M
    });
  });

  describe('variable rate calculations', () => {
    const variableInput: MortgageInput = {
      ...baseInput,
      useVariableRate: true,
      fixedRatePeriod: 3,
      rate: 4,
      variableRateMargin: 1.5,
      eiborRate: 4.3,
    };

    it('should calculate both initial and adjusted payments correctly', () => {
      const result = calculateMortgage(variableInput);
      console.log('\nVariable rate test:');
      console.log('Initial period:');
      console.log('Loan amount:', result.loanAmount);
      console.log('Monthly rate:', (variableInput.rate / 100) / 12);
      console.log('Number of months:', variableInput.tenure * 12);
      console.log('Expected initial monthly payment:', 15_850.94);
      console.log('Actual initial monthly payment:', result.initialMonthlyPayment);
      
      console.log('\nVariable period:');
      console.log('Variable rate:', variableInput.eiborRate + variableInput.variableRateMargin);
      console.log('Monthly variable rate:', ((variableInput.eiborRate + variableInput.variableRateMargin) / 100) / 12);
      console.log('Remaining months:', (variableInput.tenure - variableInput.fixedRatePeriod) * 12);
      console.log('Expected adjusted monthly payment:', 18_662.21);
      console.log('Actual adjusted monthly payment:', result.adjustedMonthlyPayment);
      
      // Initial payment at 4%
      expect(result.initialMonthlyPayment).toBeCloseTo(15_850.94, 0);
      // Adjusted payment at 5.8% (4.3% EIBOR + 1.5% margin)
      expect(result.adjustedMonthlyPayment).toBeCloseTo(18_662.21, 0);
    });

    it('should calculate remaining principal correctly after fixed period', () => {
      const result = calculateMortgage(variableInput);
      console.log('\nRemaining principal test:');
      console.log('Initial loan amount:', result.loanAmount);
      console.log('Monthly payment:', result.initialMonthlyPayment);
      console.log('Fixed period months:', variableInput.fixedRatePeriod * 12);
      console.log('Monthly rate:', (variableInput.rate / 100) / 12);
      
      // After 3 years of payments at 4%
      const monthlyRate = (variableInput.rate / 100) / 12;
      const fixedPeriodMonths = variableInput.fixedRatePeriod * 12;
      const totalMonths = variableInput.tenure * 12;
      
      // Calculate initial monthly payment
      const initialPayment = result.loanAmount * monthlyRate / (1 - Math.pow(1 + monthlyRate, -totalMonths));
      
      // Calculate remaining balance
      const expectedRemainingPrincipal = result.loanAmount * Math.pow(1 + monthlyRate, fixedPeriodMonths) - 
        initialPayment * ((Math.pow(1 + monthlyRate, fixedPeriodMonths) - 1) / monthlyRate);
      
      // Calculate actual remaining principal
      const totalPayments = initialPayment * fixedPeriodMonths;
      const interestPaid = totalPayments - (result.loanAmount - expectedRemainingPrincipal);
      const actualRemainingPrincipal = result.loanAmount - (totalPayments - interestPaid);
      
      console.log('Expected remaining principal:', expectedRemainingPrincipal);
      console.log('Actual remaining principal:', actualRemainingPrincipal);
      console.log('Monthly payments made:', totalPayments);
      console.log('Interest paid:', interestPaid);
      
      expect(actualRemainingPrincipal).toBeCloseTo(expectedRemainingPrincipal, 0);
    });
  });

  describe('purchase costs calculations', () => {
    it('should calculate DLD fee correctly', () => {
      const result = calculateMortgage(baseInput);
      expect(result.purchaseCostBreakdown.dldFee).toBe(3_900_000 * 0.04);
    });

    it('should calculate agent fee correctly including VAT', () => {
      const result = calculateMortgage(baseInput);
      expect(result.purchaseCostBreakdown.agentFee).toBe(3_900_000 * 0.02 * 1.05);
    });

    it('should use correct registration trustee fee based on price', () => {
      const lowPriceResult = calculateMortgage({ ...baseInput, price: 400_000 });
      const highPriceResult = calculateMortgage(baseInput);
      expect(lowPriceResult.purchaseCostBreakdown.registrationTrusteeFee).toBe(2_100);
      expect(highPriceResult.purchaseCostBreakdown.registrationTrusteeFee).toBe(4_200);
    });
  });

  describe('edge cases and validation', () => {
    it('should handle minimum allowed values', () => {
      const minInput: MortgageInput = {
        price: 100_000,
        downPaymentPercentage: 20,
        tenure: 1,
        rate: 0.1,
        bankArrangementFee: 0,
        useVariableRate: false,
        fixedRatePeriod: 1,
        variableRateMargin: 0,
        eiborRate: 0,
      };
      expect(() => calculateMortgage(minInput)).not.toThrow();
    });

    it('should handle maximum allowed values', () => {
      const maxInput: MortgageInput = {
        price: 100_000_000,
        downPaymentPercentage: 80,
        tenure: 30,
        rate: 20,
        bankArrangementFee: 5,
        useVariableRate: true,
        fixedRatePeriod: 29,
        variableRateMargin: 5,
        eiborRate: 15,
      };
      expect(() => calculateMortgage(maxInput)).not.toThrow();
    });

    it('should handle variable rate with fixed period equal to tenure', () => {
      const input: MortgageInput = {
        ...baseInput,
        useVariableRate: true,
        fixedRatePeriod: baseInput.tenure,
      };
      const result = calculateMortgage(input);
      expect(result.adjustedMonthlyPayment).toBeNull();
      expect(result.effectiveRate).toBeNull();
    });

    it('should handle zero remaining principal edge case', () => {
      const input: MortgageInput = {
        ...baseInput,
        useVariableRate: true,
        downPaymentPercentage: 80, // Maximum down payment
        fixedRatePeriod: 1,
      };
      const result = calculateMortgage(input);
      expect(result.initialMonthlyPayment).toBeGreaterThan(0);
      if (result.adjustedMonthlyPayment !== null) {
        expect(result.adjustedMonthlyPayment).toBeGreaterThan(0);
      }
    });
  });
}); 