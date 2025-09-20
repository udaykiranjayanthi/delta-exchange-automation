import { Card, Box, Text, useMantineTheme } from "@mantine/core";
import { LineChart } from "@mantine/charts";
import "@mantine/charts/styles.css";

interface GraphData {
  currentPrice: number;
  timestamp: number;
}

interface PriceGraphProps {
  graphData: GraphData[];
  investedValue: number;
  upperLimit: number | null;
  lowerLimit: number | null;
}

export function PriceGraph({
  graphData,
  investedValue,
  upperLimit,
  lowerLimit,
}: PriceGraphProps) {
  const theme = useMantineTheme();

  // Format data for the chart
  const formattedData = graphData.map((item) => ({
    date: new Date(item.timestamp).toLocaleTimeString(),
    currentValue: item.currentPrice,
  }));

  // Only keep the last 60 data points (2 minute of data)
  const displayData = formattedData.slice(-60);

  // Calculate min and max values to ensure reference lines are visible
  const allValues = [
    ...displayData.map((item) => item.currentValue),
    investedValue,
    ...(upperLimit !== null ? [upperLimit] : []),
    ...(lowerLimit !== null ? [lowerLimit] : []),
  ].filter((value) => !isNaN(value) && value !== null && value !== undefined);

  // Add padding to ensure all values are visible
  // Default to a reasonable range if no values are available
  const minValue = allValues.length > 0 ? Math.min(...allValues) - 0.005 : 0;
  const maxValue = allValues.length > 0 ? Math.max(...allValues) + 0.005 : 100;

  // Create reference lines data
  const referenceLines = [
    {
      y: investedValue,
      label: `Invested (${investedValue})`,
      color: theme.colors.gray[6],
    },
    ...(upperLimit !== null
      ? [
          {
            y: upperLimit,
            label: `Upper Limit (${upperLimit})`,
            color: theme.colors.green[6],
          },
        ]
      : []),
    ...(lowerLimit !== null
      ? [
          {
            y: lowerLimit,
            label: `Lower Limit (${lowerLimit})`,
            color: theme.colors.red[6],
          },
        ]
      : []),
  ];

  return (
    <Card withBorder p="md">
      <Box h={350}>
        {displayData.length > 0 ? (
          <LineChart
            h={350}
            data={displayData}
            dataKey="date"
            series={[{ name: "currentValue", color: "blue.6" }]}
            referenceLines={referenceLines}
            // withLegend
            withDots={false}
            legendProps={{ verticalAlign: "bottom" }}
            yAxisProps={{
              width: 60,
              domain: [minValue, maxValue],
              tickFormatter: (value) => value.toFixed(5),
            }}
            tooltipProps={{
              content: ({ label, payload }) => {
                if (!payload || payload.length === 0) return null;
                return (
                  <Card withBorder shadow="sm" p="xs" radius="md">
                    <Text size="sm" fw={500}>
                      {label}
                    </Text>
                    <Text size="sm" c="blue">
                      Value: {payload[0]?.payload?.currentValue?.toFixed(5)}
                    </Text>
                  </Card>
                );
              },
            }}
          />
        ) : (
          <Box
            h={280}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text c="dimmed">No data available</Text>
          </Box>
        )}
      </Box>
    </Card>
  );
}
