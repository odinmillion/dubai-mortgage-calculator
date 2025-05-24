import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Title,
  NumberInput,
  Text,
  Stack,
  Grid,
  Card,
  Popover,
  List,
  Group
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { calculateMortgage } from '../utils/mortgageCalculator';
import type { MortgageInput, MortgageResult } from '../utils/mortgageCalculator';

export function MortgageCalculator() {
  const [result, setResult] = useState<MortgageResult | null>(null);

  const form = useForm<MortgageInput>({
    initialValues: {
      price: 4000000,
      downPaymentPercentage: 20,
      tenure: 25,
      rate: 4,
      bankArrangementFee: 1,
    },
    validate: {
      price: (value) => (value < 100000 ? 'Price must be at least 100,000 AED' : null),
      downPaymentPercentage: (value) => (value < 20 || value > 80 ? 'Down payment must be between 20% and 80%' : null),
      tenure: (value) => (value < 1 || value > 30 ? 'Tenure must be between 1 and 30 years' : null),
      rate: (value) => (value <= 0 || value > 20 ? 'Interest rate must be between 0 and 20%' : null),
      bankArrangementFee: (value) => (value < 0 || value > 5 ? 'Bank arrangement fee must be between 0% and 5%' : null),
    },
  });

  // Recalculate on every input change
  useEffect(() => {
    if (!form.isValid()) {
      setResult(null);
      return;
    }
    setResult(calculateMortgage(form.values));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(value));
  };

  const formatPercentage = (value: number) => {
    return value ? `${value.toFixed(2)}%` : '0.00%';
  };

  return (
    <Container size="md" py="xl">
      <Title ta="center" mb="xl">
        Dubai Mortgage Calculator
      </Title>

      <Paper shadow="xs" p="md" mb="xl">
        <form>
          <Grid>
            <Grid.Col span={6}>
              <NumberInput
                label="Property Price (AED)"
                placeholder="Enter property price"
                {...form.getInputProps('price')}
                step={50000}
                min={100000}
                max={100000000}
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Down Payment (%)"
                placeholder="Enter down payment percentage"
                {...form.getInputProps('downPaymentPercentage')}
                step={1}
                min={20}
                max={80}
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Loan Tenure (Years)"
                placeholder="Enter loan tenure"
                {...form.getInputProps('tenure')}
                step={1}
                min={1}
                max={30}
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Interest Rate (%)"
                placeholder="Enter interest rate"
                {...form.getInputProps('rate')}
                step={0.1}
                min={0.1}
                max={20}
                decimalScale={2}
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Bank Arrangement Fee (%)"
                placeholder="Enter bank fee"
                {...form.getInputProps('bankArrangementFee')}
                step={0.5}
                min={0}
                max={5}
                decimalScale={2}
                required
              />
            </Grid.Col>
          </Grid>
        </form>
      </Paper>

      {result && (
        <Stack gap="md">
          <Card shadow="sm">
            <Title order={3} mb="md">Monthly Payment</Title>
            <Text size="xl" fw={700} c="blue">
              {formatCurrency(result.monthlyPayment)}
            </Text>
          </Card>

          <Grid>
            <Grid.Col span={6}>
              <Card shadow="sm">
                <Stack>
                  <Title order={4}>Upfront Costs</Title>
                  <Text>Down Payment: {formatCurrency(result.downPayment)}</Text>
                  <Popover width={400} position="bottom" withArrow shadow="md">
                    <Popover.Target>
                      <Text style={{ cursor: 'pointer' }} td="underline">
                        Purchase Costs: {formatCurrency(result.purchaseCost)}
                      </Text>
                    </Popover.Target>
                    <Popover.Dropdown>
                      <Stack>
                        <Text fw={500}>Purchase Costs Breakdown:</Text>
                        <List spacing="xs" size="sm">
                          <List.Item>
                            <Group justify="space-between">
                              <Text>DLD Fee (4%):</Text>
                              <Text>{formatCurrency(result.purchaseCostBreakdown.dldFee)}</Text>
                            </Group>
                          </List.Item>
                          <List.Item>
                            <Group justify="space-between">
                              <Text>Agent Fee (2% + VAT):</Text>
                              <Text>{formatCurrency(result.purchaseCostBreakdown.agentFee)}</Text>
                            </Group>
                          </List.Item>
                          <List.Item>
                            <Group justify="space-between">
                              <Text>Registration Trustee Fee:</Text>
                              <Text>{formatCurrency(result.purchaseCostBreakdown.registrationTrusteeFee)}</Text>
                            </Group>
                          </List.Item>
                          <List.Item>
                            <Group justify="space-between">
                              <Text>Mortgage Registration ({formatPercentage(0.25)}):</Text>
                              <Text>{formatCurrency(result.purchaseCostBreakdown.mortgageRegistrationFee)}</Text>
                            </Group>
                          </List.Item>
                          <List.Item>
                            <Group justify="space-between">
                              <Text>Mortgage Valuation Fee:</Text>
                              <Text>{formatCurrency(result.purchaseCostBreakdown.mortgageValuationFee)}</Text>
                            </Group>
                          </List.Item>
                          <List.Item>
                            <Group justify="space-between">
                              <Text>Bank Arrangement Fee ({formatPercentage(form.values.bankArrangementFee)} + VAT):</Text>
                              <Text>{formatCurrency(result.purchaseCostBreakdown.bankArrangementFee)}</Text>
                            </Group>
                          </List.Item>
                        </List>
                        <Text fw={700} mt="sm">
                          Total Purchase Costs: {formatCurrency(result.purchaseCost)}
                        </Text>
                      </Stack>
                    </Popover.Dropdown>
                  </Popover>
                  <Text fw={700}>Total Upfront: {formatCurrency(result.totalUpfront)}</Text>
                </Stack>
              </Card>
            </Grid.Col>
            <Grid.Col span={6}>
              <Card shadow="sm">
                <Stack>
                  <Title order={4}>Loan Details</Title>
                  <Text>Loan Amount: {formatCurrency(result.loanAmount)}</Text>
                  <Text>Total Interest: {formatCurrency(result.totalInterest)}</Text>
                  <Text fw={700}>
                    Total Cost: {formatCurrency(result.loanAmount + result.totalInterest)}
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Stack>
      )}
    </Container>
  );
} 