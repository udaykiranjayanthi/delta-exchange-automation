import { Table, Text } from "@mantine/core";
import type { Price } from "../types";

interface PositionsTableProps {
  prices: Price[];
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
    <Table highlightOnHover variant="vertical" withTableBorder>
      <Table.Tbody>
        {prices.map((price) => (
          <Table.Tr key={price.symbol}>
            <Table.Th>{price.symbol.split(":")[1]}</Table.Th>

            <Table.Td>{price.price}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
