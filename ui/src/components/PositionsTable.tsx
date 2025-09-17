import { Group, Pill, Table, Text } from "@mantine/core";
import type { Position, Price } from "../types";

interface PositionsTableProps {
  positions: Position[];
  prices: Record<string, Price>;
}

export function PositionsTable({ positions, prices }: PositionsTableProps) {
  if (positions.length === 0) {
    return (
      <Text ta="center" c="dimmed" py="xl">
        No positions yet
      </Text>
    );
  }

  return (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Symbol</Table.Th>
          <Table.Th>Size</Table.Th>
          <Table.Th>Contract Value</Table.Th>
          <Table.Th>Entry Price</Table.Th>
          <Table.Th>Liquidation Price</Table.Th>
          <Table.Th>Entry</Table.Th>
          <Table.Th>Current Value</Table.Th>
          <Table.Th>Returns</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {positions.map((position) => {
          const isBuy = position.size > 0;

          const currentMarkPrice = parseFloat(
            prices[`MARK:${position.product_symbol}`]?.price
          );
          const entryPrice = parseFloat(position.entry_price);
          const contractValue = parseFloat(position.product.contract_value);

          const entryValue = entryPrice * position.size * contractValue;
          const currentValue = currentMarkPrice * position.size * contractValue;

          const returns = currentValue - entryValue;

          const returnsPercentage =
            (returns / (entryPrice * contractValue * Math.abs(position.size))) *
            100;

          return (
            <Table.Tr key={position.product_symbol}>
              <Table.Td>{position.product_symbol}</Table.Td>
              <Table.Td>
                <Text c={isBuy ? "green" : "red"} fw={500}>
                  <Group>
                    {position.size}{" "}
                    <Pill bg={isBuy ? "green" : "red"}>
                      {isBuy ? "BUY" : "SELL"}
                    </Pill>
                  </Group>
                </Text>
              </Table.Td>
              <Table.Td>{position.product.contract_value}</Table.Td>
              <Table.Td>{position.entry_price}</Table.Td>
              <Table.Td>{position.liquidation_price || "-"}</Table.Td>
              <Table.Td>{entryValue.toFixed(5)}</Table.Td>
              <Table.Td>{currentValue.toFixed(5)}</Table.Td>
              <Table.Td>
                {
                  <Text c={returns > 0 ? "green" : "red"} size="sm" fw={500}>
                    {returns.toFixed(5)} ({returnsPercentage.toFixed(2)}%)
                  </Text>
                }
              </Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
}
