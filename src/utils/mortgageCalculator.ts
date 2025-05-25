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

  if (useVariableRate && fixedRatePeriod < tenure) {
    // Calculate for fixed rate period
    const monthlyRate = rate / (12 * 100);
    const totalMonths = tenure * 12;
    
    // Calculate initial monthly payment
    initialMonthlyPayment = loanAmount * monthlyRate / (1 - Math.pow(1 + monthlyRate, -totalMonths));
    
    // Calculate remaining balance after fixed period
    const fixedPeriodMonths = fixedRatePeriod * 12;
    const remainingPrincipal = loanAmount * Math.pow(1 + monthlyRate, fixedPeriodMonths) - 
      initialMonthlyPayment * ((Math.pow(1 + monthlyRate, fixedPeriodMonths) - 1) / monthlyRate);

    // Calculate adjusted payment for variable rate period
    const variableRate = eiborRate + variableRateMargin;
    const variableMonthlyRate = variableRate / (12 * 100);
    const remainingMonths = totalMonths - fixedPeriodMonths;
    
    adjustedMonthlyPayment = remainingPrincipal * variableMonthlyRate / 
      (1 - Math.pow(1 + variableMonthlyRate, -remainingMonths));

    // Calculate total interest
    const interestFixed = (initialMonthlyPayment * fixedPeriodMonths) - 
      (loanAmount - remainingPrincipal);
    const interestVariable = (adjustedMonthlyPayment * remainingMonths) - remainingPrincipal;
    totalInterest = interestFixed + interestVariable;

    // Set effective rate
    effectiveRate = variableRate;
  } else {
    // Standard fixed rate calculation
    const monthlyRate = rate / (12 * 100);
    const numberOfPayments = tenure * 12;
    initialMonthlyPayment = loanAmount * monthlyRate / (1 - Math.pow(1 + monthlyRate, -numberOfPayments));
    totalInterest = (initialMonthlyPayment * numberOfPayments) - loanAmount;
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