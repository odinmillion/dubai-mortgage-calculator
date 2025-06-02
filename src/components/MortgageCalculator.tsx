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
  Group,
  Box,
  UnstyledButton,
  Collapse,
  Switch,
  Divider
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { calculateMortgage } from '../utils/mortgageCalculator';
import type { MortgageInput, MortgageResult } from '../utils/mortgageCalculator';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { SEO } from './SEO';
import { AmortizationTable } from './AmortizationTable';

export function MortgageCalculator() {
  const [result, setResult] = useState<MortgageResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const form = useForm<MortgageInput>({
    initialValues: {
      price: 2000000,
      downPaymentPercentage: 20,
      tenure: 25,
      rate: 4,
      bankArrangementFee: 1.0,
      useVariableRate: true,
      fixedRatePeriod: 3,
      variableRateMargin: 1.5,
      eiborRate: 4.3,
    },
    validate: {
      price: (value) => (value < 100000 ? 'Price must be at least 100,000 AED' : null),
      downPaymentPercentage: (value) => (value < 20 || value > 80 ? 'Down payment must be between 20% and 80%' : null),
      tenure: (value) => (value < 1 || value > 25 ? 'Tenure must be between 1 and 25 years' : null),
      rate: (value) => (value <= 0 || value > 20 ? 'Interest rate must be between 0 and 20%' : null),
      bankArrangementFee: (value) => (value < 0 || value > 5 ? 'Bank arrangement fee must be between 0% and 5%' : null),
      fixedRatePeriod: (value, values) => {
        if (!values.useVariableRate) return null;
        return value < 1 || value > values.tenure 
          ? `Fixed rate period must be between 1 and ${values.tenure} years` 
          : null;
      },
      variableRateMargin: (value) => (value < 0 || value > 5 ? 'Variable rate margin must be between 0% and 5%' : null),
      eiborRate: (value) => (value < 0 || value > 15 ? 'EIBOR rate must be between 0% and 15%' : null),
    },
  });

  // Adjust fixed rate period when tenure changes
  useEffect(() => {
    if (form.values.useVariableRate && form.values.fixedRatePeriod > form.values.tenure) {
      // Only decrease fixed period if it becomes greater than tenure
      form.setFieldValue('fixedRatePeriod', form.values.tenure);
    }
  }, [form.values.tenure]);

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
    <>
      <SEO />
      <Container size="md" py="xl">
        <header>
          <Title ta="center" mb="xl" c="blue.7">
            Dubai Mortgage Calculator
          </Title>
        </header>

        <main>
          <article>
            <section aria-label="Mortgage Calculator Form">
              <Paper shadow="sm" p="xl" radius="md" withBorder>
                <form>
                  <Stack gap="md">
                    <Grid>
                      <Grid.Col span={6}>
                        <NumberInput
                          label="Property Price (AED)"
                          description="Minimum 100,000 AED"
                          placeholder="Enter property price"
                          {...form.getInputProps('price')}
                          step={50000}
                          min={100000}
                          max={100000000}
                          required
                          size="md"
                          hideControls={false}
                          thousandSeparator=","
                        />
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <NumberInput
                          label="Down Payment (%)"
                          description="20-80% of property price"
                          placeholder="Enter down payment percentage"
                          {...form.getInputProps('downPaymentPercentage')}
                          step={1}
                          min={20}
                          max={80}
                          required
                          size="md"
                          hideControls={false}
                        />
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <NumberInput
                          label="Loan Tenure (Years)"
                          description="1-25 years"
                          placeholder="Enter loan tenure"
                          {...form.getInputProps('tenure')}
                          step={1}
                          min={1}
                          max={30}
                          required
                          size="md"
                          hideControls={false}
                        />
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <NumberInput
                          label="Initial Interest Rate (%)"
                          description="Annual interest rate"
                          placeholder="Enter interest rate"
                          {...form.getInputProps('rate')}
                          step={0.1}
                          min={0.1}
                          max={20}
                          decimalScale={2}
                          required
                          size="md"
                          hideControls={false}
                        />
                      </Grid.Col>
                    </Grid>

                    <UnstyledButton 
                      onClick={() => setShowAdvanced((o) => !o)}
                      style={{ width: '100%', textAlign: 'left' }}
                    >
                      <Group>
                        {showAdvanced ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                        <Text size="sm" c="dimmed">Advanced Settings</Text>
                      </Group>
                    </UnstyledButton>

                    <Collapse in={showAdvanced}>
                      <Stack>
                        <Box>
                          <NumberInput
                            label="Bank Arrangement Fee (%)"
                            description="0-5% of loan amount"
                            placeholder="Enter bank fee"
                            {...form.getInputProps('bankArrangementFee')}
                            step={0.5}
                            min={0}
                            max={5}
                            decimalScale={2}
                            required
                            size="md"
                            hideControls={false}
                          />
                        </Box>
                        
                        <Divider label="Variable Rate Settings" labelPosition="center" />
                        
                        <Switch
                          label="Use Variable Rate"
                          description="Switch between fixed and variable rate mortgage"
                          {...form.getInputProps('useVariableRate', { type: 'checkbox' })}
                        />

                        {form.values.useVariableRate && (
                          <>
                            <NumberInput
                              label="Fixed Rate Period (Years)"
                              description="Initial period with fixed rate"
                              placeholder="Enter fixed rate period"
                              {...form.getInputProps('fixedRatePeriod')}
                              step={1}
                              min={1}
                              max={form.values.tenure - 1}
                              required
                              size="md"
                              hideControls={false}
                            />
                            <NumberInput
                              label="EIBOR 1M Rate (%)"
                              description="Current 1-month EIBOR rate"
                              placeholder="Enter EIBOR rate"
                              {...form.getInputProps('eiborRate')}
                              step={0.1}
                              min={0}
                              max={15}
                              decimalScale={2}
                              required
                              size="md"
                              hideControls={false}
                            />
                            <NumberInput
                              label="Bank Margin (%)"
                              description="Bank's margin over EIBOR"
                              placeholder="Enter bank margin"
                              {...form.getInputProps('variableRateMargin')}
                              step={0.1}
                              min={0}
                              max={5}
                              decimalScale={2}
                              required
                              size="md"
                              hideControls={false}
                            />
                          </>
                        )}
                      </Stack>
                    </Collapse>
                  </Stack>
                </form>
              </Paper>
            </section>

            {result && (
              <section aria-label="Calculation Results">
                <Stack gap="md" mt="xl">
                  <article aria-label="Monthly Payment">
                    <Card shadow="sm" p="xl" radius="md" withBorder>
                      <Stack>
                        <Title order={3} c="blue.7">Monthly Payment</Title>
                        <Text size="xl" fw={700} c="blue.7" component="div">
                          {formatCurrency(result.initialMonthlyPayment)}
                          {form.values.useVariableRate && form.values.fixedRatePeriod < form.values.tenure && (
                            <Text size="sm" c="dimmed" mt={5} component="div">
                              Initial payment for first {form.values.fixedRatePeriod} years at {formatPercentage(form.values.rate)}
                            </Text>
                          )}
                        </Text>
                        
                        {result.adjustedMonthlyPayment && form.values.fixedRatePeriod < form.values.tenure && (
                          <>
                            <Text size="xl" fw={700} c="red.7" component="div">
                              {formatCurrency(result.adjustedMonthlyPayment)}
                              <Text size="sm" c="dimmed" mt={5} component="div">
                                Adjusted payment after year {form.values.fixedRatePeriod} at {formatPercentage(result.effectiveRate || 0)}
                                {' '}(EIBOR {formatPercentage(form.values.eiborRate)} + {formatPercentage(form.values.variableRateMargin)})
                              </Text>
                            </Text>
                          </>
                        )}

                        <AmortizationTable result={result} />
                      </Stack>
                    </Card>
                  </article>

                  <Grid>
                    <Grid.Col span={6}>
                      <article aria-label="Upfront Costs">
                        <Card shadow="sm" p="xl" radius="md" withBorder h="100%">
                          <Stack>
                            <Title order={4} c="blue.7">Upfront Costs</Title>
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
                      </article>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <article aria-label="Loan Details">
                        <Card shadow="sm" p="xl" radius="md" withBorder h="100%">
                          <Stack>
                            <Title order={4} c="blue.7">Loan Details</Title>
                            <Text>Loan Amount: {formatCurrency(result.loanAmount)}</Text>
                            <Text>Total Interest: {formatCurrency(result.totalInterest)}</Text>
                            <Text fw={700}>Total Cost: {formatCurrency(result.loanAmount + result.totalInterest)}</Text>
                          </Stack>
                        </Card>
                      </article>
                    </Grid.Col>
                  </Grid>
                </Stack>
              </section>
            )}
          </article>
        </main>

        <footer>
          <Text size="sm" c="dimmed" ta="center" mt="xl">
            This calculator provides estimates for Dubai property purchases. The results are for informational purposes only and should not be considered as financial advice. Actual costs, interest rates, and terms may vary. Please consult with banks, licensed financial advisors, or mortgage specialists for accurate information and personalized advice.
          </Text>
        </footer>
      </Container>
    </>
  );
} 