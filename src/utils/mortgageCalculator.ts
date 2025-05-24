export interface MortgageInput {
  price: number;
  downPaymentPercentage: number;
  tenure: number;
  rate: number;
  bankArrangementFee: number;
}

export interface PurchaseCostBreakdown {
  dldFee: number;
  agentFee: number;
  registrationTrusteeFee: number;
  mortgageRegistrationFee: number;
  mortgageValuationFee: number;
  bankArrangementFee: number;
  total: number;
}

export interface MortgageResult {
  monthlyPayment: number;
  downPayment: number;
  purchaseCost: number;
  purchaseCostBreakdown: PurchaseCostBreakdown;
  totalUpfront: number;
  loanAmount: number;
  totalInterest: number;
}

export const calculateMortgage = (input: MortgageInput): MortgageResult => {
  const { price, downPaymentPercentage, tenure, rate, bankArrangementFee } = input;
  
  // Constants for Dubai mortgage calculation
  const DLD_TAX = 0.04;
  const AGENT_TAX = 0.02;
  const REGISTRATION_TRUSTEE_FEE = price < 500000 ? 2100 : 4200;
  const MORTGAGE_REGISTRATION = 0.0025;
  const MORTGAGE_VALUATION_FEE = 3150;
  const ADMIN_FEE = 580;

  // Calculate downpayment
  const downPayment = price * (downPaymentPercentage / 100);
  const loanAmount = price - downPayment;

  // Calculate individual purchase costs
  const dldFee = price * DLD_TAX;
  const agentFee = price * AGENT_TAX * 1.05; // Including 5% VAT
  const mortgageRegistrationFee = MORTGAGE_REGISTRATION * loanAmount;
  const arrangementFee = (bankArrangementFee / 100) * loanAmount * 1.05; // Including 5% VAT

  const purchaseCostBreakdown: PurchaseCostBreakdown = {
    dldFee,
    agentFee,
    registrationTrusteeFee: REGISTRATION_TRUSTEE_FEE,
    mortgageRegistrationFee,
    mortgageValuationFee: MORTGAGE_VALUATION_FEE,
    bankArrangementFee: arrangementFee,
    total: dldFee + ADMIN_FEE + agentFee + REGISTRATION_TRUSTEE_FEE + 
           mortgageRegistrationFee + MORTGAGE_VALUATION_FEE + arrangementFee
  };

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
    purchaseCost: purchaseCostBreakdown.total,
    purchaseCostBreakdown,
    totalUpfront: purchaseCostBreakdown.total + downPayment,
    loanAmount,
    totalInterest
  };
}; 