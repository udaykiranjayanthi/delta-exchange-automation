import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import { Dashboard } from "./components/Dashboard";

const theme = createTheme({
  primaryColor: "blue",
  fontFamily: "Inter, sans-serif",
});

const App = () => {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Dashboard />
    </MantineProvider>
  );
};

export default App;
