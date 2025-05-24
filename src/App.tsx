import { MantineProvider } from '@mantine/core';
import { HelmetProvider } from 'react-helmet-async';
import { MortgageCalculator } from './components/MortgageCalculator';
import '@mantine/core/styles.css';

export default function App() {
  return (
    <HelmetProvider>
      <MantineProvider>
        <MortgageCalculator />
      </MantineProvider>
    </HelmetProvider>
  );
}
