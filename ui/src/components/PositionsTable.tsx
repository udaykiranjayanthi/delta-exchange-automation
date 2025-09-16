import { Table, Text } from '@mantine/core';
import type { Position } from '../types';

interface PositionsTableProps {
  positions: Position[];
}

export function PositionsTable({ positions }: PositionsTableProps) {
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
          <Table.Th>Entry Price</Table.Th>
          <Table.Th>Liquidation Price</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {positions.map((position) => {
          const isPositive = position.size > 0;
          
          return (
            <Table.Tr key={position.product_symbol}>
              <Table.Td>{position.product_symbol}</Table.Td>
              <Table.Td>
                <Text c={isPositive ? 'green' : 'red'} fw={500}>
                  {position.size}
                </Text>
              </Table.Td>
              <Table.Td>{position.entry_price}</Table.Td>
              <Table.Td>{position.liquidation_price || '-'}</Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
}
