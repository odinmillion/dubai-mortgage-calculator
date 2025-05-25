def calculate_monthly_payment(loan_amount, annual_rate, months):
    monthly_rate = annual_rate / 12
    return loan_amount * monthly_rate / (1 - (1 + monthly_rate) ** -months)

def calculate_remaining_balance(loan_amount, annual_rate, payment, months):
    monthly_rate = annual_rate / 12
    return loan_amount * (1 + monthly_rate) ** months - payment * ((1 + monthly_rate) ** months - 1) / monthly_rate

# Test case 1: Fixed rate for entire period
loan_amount = 3003000  # 3.9M - 23% down payment
annual_rate = 0.04  # 4%
months = 25 * 12  # 25 years

payment = calculate_monthly_payment(loan_amount, annual_rate, months)
print(f"\nTest case 1: Fixed rate")
print(f"Loan amount: {loan_amount}")
print(f"Annual rate: {annual_rate}")
print(f"Monthly payment: {payment:.2f}")

# Test case 2: Variable rate after 3 years
fixed_period_months = 3 * 12  # 3 years
variable_rate = 0.058  # 5.8% (4.3% EIBOR + 1.5% margin)
remaining_months = months - fixed_period_months

# Calculate initial payment
initial_payment = calculate_monthly_payment(loan_amount, annual_rate, months)

# Calculate remaining balance after fixed period
balance = calculate_remaining_balance(loan_amount, annual_rate, initial_payment, fixed_period_months)

# Calculate new payment with variable rate
adjusted_payment = calculate_monthly_payment(balance, variable_rate, remaining_months)

print(f"\nTest case 2: Variable rate")
print(f"Initial payment (4%): {initial_payment:.2f}")
print(f"Remaining balance after {fixed_period_months} months: {balance:.2f}")
print(f"Adjusted payment (5.8%): {adjusted_payment:.2f}")

# Calculate total interest
total_payments_fixed = initial_payment * fixed_period_months
interest_fixed = total_payments_fixed - (loan_amount - balance)

total_payments_variable = adjusted_payment * remaining_months
interest_variable = total_payments_variable - balance

total_interest = interest_fixed + interest_variable
print(f"\nInterest breakdown:")
print(f"Interest during fixed period: {interest_fixed:.2f}")
print(f"Interest during variable period: {interest_variable:.2f}")
print(f"Total interest: {total_interest:.2f}") 