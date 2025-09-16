import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Card, Container, Flex, Group, Tabs, Text, Title } from "@mantine/core";
import { StatusIndicator } from "./StatusIndicator";
import { OrdersTable } from "./OrdersTable";
import { PositionsTable } from "./PositionsTable";
import { TradesTable } from "./TradesTable";
import type { ConnectionStatus, Order, Position, Trade } from "../types";

export function Dashboard() {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [orders, setOrders] = useState<Order[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    // Connect to the server
    const socketInstance = io("http://localhost:8000");

    // Set up event listeners
    socketInstance.on("connect", () => {
      setConnectionStatus("connected");
    });

    socketInstance.on("disconnect", () => {
      setConnectionStatus("disconnected");
    });

    socketInstance.on("orders", (data: Order[]) => {
      setOrders(data);
    });

    socketInstance.on("positions", (data: Position[]) => {
      setPositions(data);
    });

    socketInstance.on("trades", (data: Trade[]) => {
      setTrades(data);
    });

    // Clean up on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  console.log("Orders:", orders);
  console.log("Positions:", positions);
  console.log("Trades:", trades);

  return (
    <Container size="xl" py="md">
      <Card shadow="sm" withBorder mb="md">
        <Group justify="space-between">
          <Title order={3}>Delta Exchange Dashboard</Title>
          <StatusIndicator status={connectionStatus} />
        </Group>
      </Card>

      <Tabs defaultValue="positions">
        <Tabs.List>
          <Tabs.Tab value="positions">
            <Group gap="xs">
              <Text>Positions</Text>
              <Text size="xs" c="dimmed" fw={500}>
                ({positions.length})
              </Text>
            </Group>
          </Tabs.Tab>
          {/* <Tabs.Tab value="orders">
            <Group gap="xs">
              <Text>Orders</Text>
              <Text size="xs" c="dimmed" fw={500}>
                ({orders.length})
              </Text>
            </Group>
          </Tabs.Tab>
          <Tabs.Tab value="trades">
            <Group gap="xs">
              <Text>Trades</Text>
              <Text size="xs" c="dimmed" fw={500}>
                ({trades.length})
              </Text>
            </Group>
          </Tabs.Tab> */}
        </Tabs.List>

        <Tabs.Panel value="positions" pt="md">
          <Card shadow="sm" withBorder>
            <Flex justify="space-between" mb="md">
              <Title order={4}>Positions</Title>
              <Text fw={500}>{positions.length}</Text>
            </Flex>
            <PositionsTable positions={positions} />
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="orders" pt="md">
          <Card shadow="sm" withBorder>
            <Flex justify="space-between" mb="md">
              <Title order={4}>Orders</Title>
              <Text fw={500}>{orders.length}</Text>
            </Flex>
            <OrdersTable orders={orders} />
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="trades" pt="md">
          <Card shadow="sm" withBorder>
            <Flex justify="space-between" mb="md">
              <Title order={4}>Trades</Title>
              <Text fw={500}>{trades.length}</Text>
            </Flex>
            <TradesTable trades={trades} />
          </Card>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
