import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import { Dashboard } from './components/Dashboard';

const theme = createTheme({
  primaryColor: 'blue',
});

const App = () => {
  return (
    <MantineProvider theme={theme}>
      <Dashboard />
    </MantineProvider>
  );
};

export default App;
