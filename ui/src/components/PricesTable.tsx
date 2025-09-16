import { Table, Text } from "@mantine/core";
import type { Prices } from "../types";

interface PositionsTableProps {
  prices: Prices[];
}

export function PricesTable({ prices }: PositionsTableProps) {
  if (prices.length === 0) {
    return (
      <Text ta="center" c="dimmed" py="xl">
        No prices yet
      </Text>
    );
  }

  return (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          {prices.map((price) => (
            <Table.Th key={price.symbol}>{price.symbol.split(":")[1]}</Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        <Table.Tr>
          {prices.map((price) => (
            <Table.Td key={price.symbol}>{price.price}</Table.Td>
          ))}
        </Table.Tr>
      </Table.Tbody>
    </Table>
  );
}
