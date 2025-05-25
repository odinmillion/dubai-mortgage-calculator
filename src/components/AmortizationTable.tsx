import { useState, useMemo, useRef } from 'react';
import { UnstyledButton, Paper, Text, Stack, Collapse, Group, Tooltip } from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual';
import type { MortgageResult } from '../utils/mortgageCalculator';
import styles from './AmortizationTable.module.css';

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

const ROW_HEIGHT = 37; // Approximate height of a table row in pixels

const formatNumber = new Intl.NumberFormat('en-AE', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function AmortizationTable({ result }: AmortizationTableProps) {
  const [opened, setOpened] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);

  // Memoize the schedule calculation
  const schedule = useMemo(() => {
    const rows: AmortizationRow[] = [];
    let balance = result.loanAmount;
    let totalInterestPaid = 0;
    let totalPrincipalPaid = 0;

    const initialMonthlyRate = result.initialRate / 12 / 100;
    const adjustedMonthlyRate = result.effectiveRate ? result.effectiveRate / 12 / 100 : initialMonthlyRate;

    const totalMonths = result.tenure * 12;
    const fixedPeriodMonths = result.fixedPeriodMonths || totalMonths;

    const calculateMonthlyPayment = (principal: number, monthlyRate: number, months: number) => {
      return principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    };

    const initialPayment = calculateMonthlyPayment(result.loanAmount, initialMonthlyRate, totalMonths);
    const adjustedPayment = result.adjustedMonthlyPayment || initialPayment;

    for (let month = 1; month <= totalMonths; month++) {
      const isAdjustedRate = month > fixedPeriodMonths;
      const currentRate = isAdjustedRate ? adjustedMonthlyRate : initialMonthlyRate;
      const monthlyPayment = isAdjustedRate ? adjustedPayment : initialPayment;

      const interestPayment = balance * currentRate;
      const principalPayment = monthlyPayment - interestPayment;
      
      totalInterestPaid += interestPayment;
      totalPrincipalPaid += principalPayment;
      balance = Math.max(0, balance - principalPayment);

      rows.push({
        month,
        payment: monthlyPayment,
        interest: interestPayment,
        principal: principalPayment,
        remainingBalance: balance,
        totalInterestPaid,
        totalPrincipalPaid,
        rate: currentRate * 12 * 100,
      });
    }

    return rows;
  }, [result]);
  
  const virtualizer = useVirtualizer({
    count: schedule.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  return (
    <Stack mt="xl">
      <UnstyledButton 
        onClick={() => setOpened((o) => !o)}
        style={{ width: '100%', textAlign: 'left' }}
      >
        <Group>
          {opened ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          <Text size="sm" c="dimmed">Payment Schedule</Text>
        </Group>
      </UnstyledButton>

      <Collapse in={opened}>
        <Paper shadow="sm" p="md" withBorder>
          <Text size="sm" mb="md" c="dimmed">
            Monthly breakdown of your mortgage payments
          </Text>
          <div style={{ width: '100%', overflow: 'hidden' }}>
            {/* Header */}
            <div className={styles.header}>
              <Tooltip label="Payment month number">
                <div>Month</div>
              </Tooltip>
              <Tooltip label="Annual interest rate applied for this month">
                <div>Rate</div>
              </Tooltip>
              <Tooltip label="Total monthly payment (principal + interest)">
                <div>Payment (AED)</div>
              </Tooltip>
              <Tooltip label="Interest portion of the monthly payment">
                <div>Interest (AED)</div>
              </Tooltip>
              <Tooltip label="Principal portion of the monthly payment">
                <div>Principal (AED)</div>
              </Tooltip>
              <Tooltip label="Remaining loan balance after this payment">
                <div>Balance (AED)</div>
              </Tooltip>
              <Tooltip label="Total interest paid up to this month">
                <div>Interest Paid (AED)</div>
              </Tooltip>
              <Tooltip label="Total principal paid up to this month">
                <div>Principal Paid (AED)</div>
              </Tooltip>
            </div>

            {/* Scrollable content */}
            <div
              ref={parentRef}
              style={{
                height: '400px',
                overflow: 'auto',
                position: 'relative',
              }}
            >
              <div
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {virtualizer.getVirtualItems().map((virtualRow: VirtualItem) => {
                  const row = schedule[virtualRow.index];
                  const isEven = virtualRow.index % 2 === 0;
                  
                  return (
                    <div
                      key={row.month}
                      className={styles.row}
                      style={{
                        height: `${ROW_HEIGHT}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                        backgroundColor: isEven ? 'var(--mantine-color-gray-0)' : 'transparent',
                      }}
                    >
                      <div>{row.month}</div>
                      <div>{row.rate.toFixed(2)}%</div>
                      <div>{formatNumber.format(Math.round(row.payment))}</div>
                      <div>{formatNumber.format(Math.round(row.interest))}</div>
                      <div>{formatNumber.format(Math.round(row.principal))}</div>
                      <div>{formatNumber.format(Math.round(row.remainingBalance))}</div>
                      <div>{formatNumber.format(Math.round(row.totalInterestPaid))}</div>
                      <div>{formatNumber.format(Math.round(row.totalPrincipalPaid))}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Paper>
      </Collapse>
    </Stack>
  );
} 