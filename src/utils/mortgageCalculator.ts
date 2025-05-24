export interface MortgageInput {
  price: number;
  downPaymentPercentage: number;
  tenure: number;
  rate: number;
}

export interface MortgageResult {
  monthlyPayment: number;
  downPayment: number;
  purchaseCost: number;
  totalUpfront: number;
  loanAmount: number;
  totalInterest: number;
}

export const calculateMortgage = (input: MortgageInput): MortgageResult => {
  const { price, downPaymentPercentage, tenure, rate } = input;
  
  // Constants for Dubai mortgage calculation
  const DLD_TAX = 0.04;
  const AGENT_TAX = 0.02;
  const REGISTRATION_TRUSTEE_FEE = price < 500000 ? 2100 : 4200;
  const MORTGAGE_REGISTRATION = 0.0025;
  const MORTGAGE_VALUATION_FEE = 3150;
  const BANK_ARRANGEMENT = 0; // 0.01 if applicable

  // Calculate downpayment
  const downPayment = price * (downPaymentPercentage / 100);
  const loanAmount = price - downPayment;

  // Calculate purchase costs
  const purchaseCost = 
    price * DLD_TAX + 580 +
    price * AGENT_TAX * 1.05 +
    REGISTRATION_TRUSTEE_FEE +
    MORTGAGE_REGISTRATION * loanAmount +
    MORTGAGE_VALUATION_FEE +
    BANK_ARRANGEMENT * loanAmount * 1.05;

  // Calculate monthly payment
  const monthlyRate = rate / (12 * 100);
  const numberOfPayments = tenure * 12;
  const factor = Math.pow(1 + monthlyRate, numberOfPayments);
  const monthlyPayment = loanAmount * monthlyRate * factor / (factor - 1);

  // Calculate total interest
  const totalInterest = (monthlyPayment * numberOfPayments) - loanAmount;

  return {
    monthlyPayment,
    downPayment,
    purchaseCost,
    totalUpfront: purchaseCost + downPayment,
    loanAmount,
    totalInterest
  };
}; 