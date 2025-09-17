import { Badge, Table, Text } from "@mantine/core";
import type { Order } from "../types";

interface OrdersTableProps {
  orders: Order[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <Text ta="center" c="dimmed" py="xl">
        No orders yet
      </Text>
    );
  }

  return (
    <Table withTableBorder striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>ID</Table.Th>
          <Table.Th>Symbol</Table.Th>
          <Table.Th>Side</Table.Th>
          <Table.Th>Size</Table.Th>
          <Table.Th>Type</Table.Th>
          <Table.Th>Price</Table.Th>
          <Table.Th>Status</Table.Th>
          <Table.Th>Created At</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {orders.map((order) => {
          const statusColor =
            order.state === "closed"
              ? "green"
              : order.state === "cancelled"
              ? "red"
              : "blue";

          const createdAt = new Date(order.created_at).toLocaleString();
          const price = order.average_fill_price || order.limit_price || "-";

          return (
            <Table.Tr key={order.id}>
              <Table.Td>{order.id}</Table.Td>
              <Table.Td>{order.product_symbol}</Table.Td>
              <Table.Td>
                <Text c={order.side === "buy" ? "green" : "red"} fw={500}>
                  {order.side.toUpperCase()}
                </Text>
              </Table.Td>
              <Table.Td>{order.size}</Table.Td>
              <Table.Td>{order.order_type.replace("_", " ")}</Table.Td>
              <Table.Td>{price}</Table.Td>
              <Table.Td>
                <Badge color={statusColor} variant="light">
                  {order.state}
                </Badge>
              </Table.Td>
              <Table.Td>{createdAt}</Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
}
