import { Card, Group, Text } from "@mantine/core";
import type { Position, Price } from "../types";

interface SummaryProps {
  prices: Record<string, Price>;
  positions: Position[];
  sellMax: number | null;
  sellMin: number | null;
}

export function Summary({ prices, positions, sellMax, sellMin }: SummaryProps) {
  const invested = Object.values(positions).reduce(
    (acc, position) => acc + parseFloat(position.entry_price) * position.size,
    0
  );
  const currentValue = Object.values(positions).reduce((acc, position) => {
    const markPrice = parseFloat(
      prices[`MARK:${position.product_symbol}`]?.price
    );
    return acc + markPrice * position.size;
  }, 0);
  const returns = currentValue - invested;

  return (
    <Group justify="stretch">
      <Card withBorder>
        <Text fw={600} c="dimmed">
          Invested
        </Text>
        <Text>{invested.toFixed(5)}</Text>
      </Card>
      <Card withBorder>
        <Text fw={600} c="dimmed">
          Current
        </Text>
        <Text>{currentValue.toFixed(5)}</Text>
      </Card>

      <Card withBorder>
        <Text fw={600} c="dimmed">
          Returns
        </Text>
        <Text c={returns > 0 ? "green" : "red"}>
          {returns.toFixed(5)} ({((returns / invested) * 100).toFixed(2)}%)
        </Text>
      </Card>

      <Card withBorder>
        <Text fw={600} c="dimmed">
          Sell Max
        </Text>
        <Text>{sellMax || "N/A"}</Text>
      </Card>

      <Card withBorder>
        <Text fw={600} c="dimmed">
          Sell Min
        </Text>
        <Text>{sellMin || "N/A"}</Text>
      </Card>
    </Group>
  );
}
