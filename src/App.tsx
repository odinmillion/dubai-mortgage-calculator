import { MantineProvider } from '@mantine/core';
import { MortgageCalculator } from './components/MortgageCalculator';
import '@mantine/core/styles.css';

function App() {
  return (
    <MantineProvider>
      <MortgageCalculator />
    </MantineProvider>
  );
}

export default App;
