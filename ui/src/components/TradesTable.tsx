import { Table, Text } from '@mantine/core';
import type { Trade } from '../types';

interface TradesTableProps {
  trades: Trade[];
}

export function TradesTable({ trades }: TradesTableProps) {
  if (trades.length === 0) {
    return (
      <Text ta="center" c="dimmed" py="xl">
        No trades yet
      </Text>
    );
  }

  return (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>ID</Table.Th>
          <Table.Th>Symbol</Table.Th>
          <Table.Th>Side</Table.Th>
          <Table.Th>Size</Table.Th>
          <Table.Th>Price</Table.Th>
          <Table.Th>Time</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {trades.map((trade) => {
          const createdAt = new Date(trade.created_at).toLocaleString();
          
          return (
            <Table.Tr key={trade.id}>
              <Table.Td>{trade.id}</Table.Td>
              <Table.Td>{trade.product_symbol}</Table.Td>
              <Table.Td>
                <Text c={trade.side === 'buy' ? 'green' : 'red'} fw={500}>
                  {trade.side.toUpperCase()}
                </Text>
              </Table.Td>
              <Table.Td>{trade.size}</Table.Td>
              <Table.Td>{trade.price}</Table.Td>
              <Table.Td>{createdAt}</Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
}
