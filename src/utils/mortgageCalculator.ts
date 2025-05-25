export interface MortgageInput {
  price: number;
  downPaymentPercentage: number;
  tenure: number;
  rate: number;
  bankArrangementFee: number;
  useVariableRate: boolean;
  fixedRatePeriod: number;
  variableRateMargin: number;
  eiborRate: number;
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
  initialMonthlyPayment: number;
  adjustedMonthlyPayment: number | null;
  downPayment: number;
  purchaseCost: number;
  purchaseCostBreakdown: PurchaseCostBreakdown;
  totalUpfront: number;
  loanAmount: number;
  totalInterest: number;
  effectiveRate: number | null;
}

export const calculateMortgage = (input: MortgageInput): MortgageResult => {
  const { 
    price, 
    downPaymentPercentage, 
    tenure, 
    rate, 
    bankArrangementFee,
    useVariableRate,
    fixedRatePeriod,
    variableRateMargin,
    eiborRate
  } = input;
  
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

  let initialMonthlyPayment: number;
  let adjustedMonthlyPayment: number | null = null;
  let totalInterest = 0;
  let effectiveRate: number | null = null;

  // Helper function to calculate monthly payment
  const calculatePayment = (principal: number, annualRate: number, months: number): number => {
    const monthlyRate = annualRate / 12;
    return principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months));
  };

  // Helper function to calculate remaining balance
  const calculateRemainingBalance = (principal: number, annualRate: number, payment: number, months: number): number => {
    const monthlyRate = annualRate / 12;
    return principal * Math.pow(1 + monthlyRate, months) - payment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  };

  if (useVariableRate && fixedRatePeriod < tenure) {
    // Convert rates to decimal form (4% -> 0.04)
    const fixedRateDecimal = rate / 100;
    const variableRateDecimal = (eiborRate + variableRateMargin) / 100;
    
    const totalMonths = tenure * 12;
    const fixedPeriodMonths = fixedRatePeriod * 12;
    
    // Calculate initial monthly payment using fixed rate
    initialMonthlyPayment = calculatePayment(loanAmount, fixedRateDecimal, totalMonths);
    
    // Calculate remaining balance after fixed period
    const balance = calculateRemainingBalance(loanAmount, fixedRateDecimal, initialMonthlyPayment, fixedPeriodMonths);

    // Calculate adjusted payment for variable rate period
    const remainingMonths = totalMonths - fixedPeriodMonths;
    adjustedMonthlyPayment = calculatePayment(balance, variableRateDecimal, remainingMonths);

    // Calculate total interest
    const interestFixed = (initialMonthlyPayment * fixedPeriodMonths) - (loanAmount - balance);
    const interestVariable = (adjustedMonthlyPayment * remainingMonths) - balance;
    totalInterest = interestFixed + interestVariable;

    // Set effective rate
    effectiveRate = eiborRate + variableRateMargin;
  } else {
    // Standard fixed rate calculation
    const fixedRateDecimal = rate / 100;
    const totalMonths = tenure * 12;
    initialMonthlyPayment = calculatePayment(loanAmount, fixedRateDecimal, totalMonths);
    totalInterest = (initialMonthlyPayment * totalMonths) - loanAmount;
  }

  return {
    initialMonthlyPayment,
    adjustedMonthlyPayment,
    downPayment,
    purchaseCost: purchaseCostBreakdown.total,
    purchaseCostBreakdown,
    totalUpfront: purchaseCostBreakdown.total + downPayment,
    loanAmount,
    totalInterest,
    effectiveRate
  };
}; 