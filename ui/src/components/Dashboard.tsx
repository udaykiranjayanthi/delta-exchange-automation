import { useEffect, useState } from "react";
import { Card, Container, Flex, Group, Tabs, Text, Title } from "@mantine/core";
import { StatusIndicator } from "./StatusIndicator";
import { PositionsTable } from "./PositionsTable";
import type { ConnectionStatus, Position, Price } from "../types";
import { PricesTable } from "./PricesTable";
import { Summary } from "./Summary";
import { socket } from "../common/socket";
// import { positions as positionsData, markPrices } from "../../data";

export function Dashboard() {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [prices, setPrices] = useState<Record<string, Price>>({});
  const [positions, setPositions] = useState<Position[]>([]);
  const [upperLimit, setUpperLimit] = useState<number | null>(null);
  const [lowerLimit, setLowerLimit] = useState<number | null>(null);

  useEffect(() => {
    // Connect to the server
    socket.connect();

    // Set up event listeners
    socket.on("connect", () => {
      setConnectionStatus("connected");
    });

    socket.on("disconnect", () => {
      setConnectionStatus("disconnected");
    });

    socket.on("positions", (data: Position[]) => {
      setPositions(data);
    });

    socket.on("prices", (data: Record<string, Price>) => {
      setPrices(data);
    });

    socket.on("upperLimit", (data: number) => {
      setUpperLimit(data);
    });

    socket.on("lowerLimit", (data: number) => {
      setLowerLimit(data);
    });

    // Clean up on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  console.log("Positions:", positions);
  console.log("Prices:", prices);

  return (
    <Container size="xl" py="md">
      <Card shadow="sm" withBorder mb="md">
        <Group justify="space-between">
          <Title order={3}>Delta Exchange Dashboard</Title>
          <StatusIndicator status={connectionStatus} />
        </Group>
      </Card>

      <Group justify="stretch" align="stretch">
        <Card shadow="sm" withBorder mb="md" flex={1}>
          <Flex justify="space-between" mb="md">
            <Title order={4}>Prices (active positions)</Title>
            <Text fw={500}>{Object.keys(prices).length}</Text>
          </Flex>
          <PricesTable prices={Object.values(prices)} />
        </Card>
        <Card shadow="sm" withBorder mb="md">
          <Flex justify="space-between" mb="md">
            <Title order={4}>Summary</Title>
          </Flex>
          <Summary
            prices={prices}
            positions={positions}
            upperLimit={upperLimit}
            lowerLimit={lowerLimit}
          />
        </Card>
      </Group>

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
        </Tabs.List>

        <Tabs.Panel value="positions" pt="md">
          <Card shadow="sm" withBorder>
            <Flex justify="space-between" mb="md">
              <Title order={4}>Positions</Title>
              <Text fw={500}>{positions.length}</Text>
            </Flex>
            <PositionsTable positions={positions} prices={prices} />
          </Card>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
