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

  // Calculate monthly payments
  const calculateMonthlyPayment = (principal: number, annualRate: number, years: number) => {
    const monthlyRate = annualRate / (12 * 100);
    const numberOfPayments = years * 12;
    const factor = Math.pow(1 + monthlyRate, numberOfPayments);
    return principal * monthlyRate * factor / (factor - 1);
  };

  let initialMonthlyPayment: number;
  let adjustedMonthlyPayment: number | null = null;
  let totalInterest = 0;
  let effectiveRate: number | null = null;

  if (useVariableRate && fixedRatePeriod < tenure) {
    // Calculate initial period payment (fixed rate)
    initialMonthlyPayment = calculateMonthlyPayment(loanAmount, rate, tenure);
    
    // Calculate remaining balance after fixed period
    const monthlyRate = rate / (12 * 100);
    const fixedPeriodPayments = fixedRatePeriod * 12;
    const remainingPrincipal = loanAmount * 
      (Math.pow(1 + monthlyRate, fixedPeriodPayments) - Math.pow(1 + monthlyRate, fixedPeriodPayments * monthlyRate)) / 
      (Math.pow(1 + monthlyRate, fixedPeriodPayments) - 1);

    // Calculate adjusted payment for variable rate period
    const variableRate = eiborRate + variableRateMargin;
    const remainingYears = tenure - fixedRatePeriod;
    adjustedMonthlyPayment = calculateMonthlyPayment(remainingPrincipal, variableRate, remainingYears);

    // Calculate total interest
    totalInterest = (initialMonthlyPayment * fixedPeriodPayments + 
      adjustedMonthlyPayment * remainingYears * 12) - loanAmount;

    // Calculate effective rate
    effectiveRate = variableRate;
  } else {
    // Standard fixed rate calculation
    initialMonthlyPayment = calculateMonthlyPayment(loanAmount, rate, tenure);
    totalInterest = (initialMonthlyPayment * tenure * 12) - loanAmount;
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