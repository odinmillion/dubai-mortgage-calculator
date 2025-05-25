import { useState } from 'react';
import { Table, Button, Paper, Text, Stack, Collapse } from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import type { MortgageResult } from '../utils/mortgageCalculator';

interface AmortizationRow {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  remainingBalance: number;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
  rate: number;
}

interface AmortizationTableProps {
  result: MortgageResult;
}

export function AmortizationTable({ result }: AmortizationTableProps) {
  const [opened, setOpened] = useState(false);

  const calculateAmortizationSchedule = (): AmortizationRow[] => {
    const schedule: AmortizationRow[] = [];
    let balance = result.loanAmount;
    let totalInterestPaid = 0;
    let totalPrincipalPaid = 0;

    // Calculate monthly rates
    const initialMonthlyRate = result.initialRate / 12 / 100;
    const adjustedMonthlyRate = result.effectiveRate ? result.effectiveRate / 12 / 100 : initialMonthlyRate;

    // Calculate total months
    const totalMonths = result.tenure * 12;
    const fixedPeriodMonths = result.fixedPeriodMonths || totalMonths;

    // Calculate monthly payments using the formula: PMT = P * (r * (1 + r)^n) / ((1 + r)^n - 1)
    // where P = principal, r = monthly rate, n = number of months
    const calculateMonthlyPayment = (principal: number, monthlyRate: number, months: number) => {
      return principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    };

    const initialPayment = calculateMonthlyPayment(result.loanAmount, initialMonthlyRate, totalMonths);
    const adjustedPayment = result.adjustedMonthlyPayment || initialPayment;

    for (let month = 1; month <= totalMonths; month++) {
      // Use adjusted rate and payment after fixed period
      const isAdjustedRate = month > fixedPeriodMonths;
      const currentRate = isAdjustedRate ? adjustedMonthlyRate : initialMonthlyRate;
      const monthlyPayment = isAdjustedRate ? adjustedPayment : initialPayment;

      // Calculate interest and principal portions
      const interestPayment = balance * currentRate;
      const principalPayment = monthlyPayment - interestPayment;
      
      totalInterestPaid += interestPayment;
      totalPrincipalPaid += principalPayment;
      balance = Math.max(0, balance - principalPayment);

      schedule.push({
        month,
        payment: monthlyPayment,
        interest: interestPayment,
        principal: principalPayment,
        remainingBalance: balance,
        totalInterestPaid,
        totalPrincipalPaid,
        rate: currentRate * 12 * 100, // Convert back to annual percentage
      });
    }

    return schedule;
  };

  const schedule = calculateAmortizationSchedule();

  return (
    <Stack mt="xl">
      <Button
        onClick={() => setOpened((o) => !o)}
        variant="subtle"
        rightSection={opened ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
        justify="space-between"
        fullWidth
      >
        {opened ? 'Hide Amortization Schedule' : 'Show Amortization Schedule'}
      </Button>

      <Collapse in={opened}>
        <Paper shadow="sm" p="md">
          <Text size="sm" mb="md" c="dimmed">
            Monthly breakdown of your mortgage payments
          </Text>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Month</Table.Th>
                <Table.Th>Rate</Table.Th>
                <Table.Th>Payment</Table.Th>
                <Table.Th>Interest</Table.Th>
                <Table.Th>Principal</Table.Th>
                <Table.Th>Remaining Balance</Table.Th>
                <Table.Th>Total Interest Paid</Table.Th>
                <Table.Th>Total Principal Paid</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {schedule.map((row) => (
                <Table.Tr key={row.month}>
                  <Table.Td>{row.month}</Table.Td>
                  <Table.Td>{row.rate.toFixed(2)}%</Table.Td>
                  <Table.Td>{row.payment.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED</Table.Td>
                  <Table.Td>{row.interest.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED</Table.Td>
                  <Table.Td>{row.principal.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED</Table.Td>
                  <Table.Td>{row.remainingBalance.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED</Table.Td>
                  <Table.Td>{row.totalInterestPaid.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED</Table.Td>
                  <Table.Td>{row.totalPrincipalPaid.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      </Collapse>
    </Stack>
  );
} 