import {
  Card,
  Text,
  ActionIcon,
  TextInput,
  Flex,
  SimpleGrid,
} from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import type { Position, Price } from "../types";
import { socket } from "../common/socket";

interface SummaryProps {
  prices: Record<string, Price>;
  positions: Position[];
  sellMax: number | null;
  sellMin: number | null;
}

export function Summary({ prices, positions, sellMax, sellMin }: SummaryProps) {
  const [isEditingSellMax, setIsEditingSellMax] = useState(false);
  const [isEditingSellMin, setIsEditingSellMin] = useState(false);
  const [sellMaxValue, setSellMaxValue] = useState<string>(
    sellMax?.toString() || ""
  );
  const [sellMinValue, setSellMinValue] = useState<string>(
    sellMin?.toString() || ""
  );
  const [showPercentage, setShowPercentage] = useState(false);

  // Update local state when props change
  useEffect(() => {
    if (sellMax !== null) setSellMaxValue(sellMax.toString());
    if (sellMin !== null) setSellMinValue(sellMin.toString());
  }, [sellMax, sellMin]);

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

  const handleSellMaxSubmit = () => {
    socket.emit("sellMax", parseFloat(sellMaxValue));
    setIsEditingSellMax(false);
  };

  const handleSellMinSubmit = () => {
    socket.emit("sellMin", parseFloat(sellMinValue));
    setIsEditingSellMin(false);
  };

  return (
    <SimpleGrid cols={5}>
      <Card withBorder>
        <Text fw={600} c="dimmed">
          Invested
        </Text>
        <Text mt="xs">{invested.toFixed(5)}</Text>
      </Card>
      <Card withBorder>
        <Text fw={600} c="dimmed">
          Current
        </Text>
        <Text mt="xs">{currentValue.toFixed(5)}</Text>
      </Card>

      <Card
        withBorder
        w="9rem"
        onClick={() => setShowPercentage(!showPercentage)}
      >
        <Text fw={600} c="dimmed">
          Returns {showPercentage && "(%)"}
        </Text>
        <Text c={returns > 0 ? "green" : "red"} mt="xs">
          {showPercentage
            ? ((returns / invested) * 100).toFixed(2) + "%"
            : returns.toFixed(5)}
        </Text>
      </Card>

      <Card withBorder>
        <Flex align="center" gap="xs">
          <Text fw={600} c="dimmed">
            Sell Max
          </Text>
          <ActionIcon
            size="xs"
            variant="subtle"
            onClick={() => setIsEditingSellMax(!isEditingSellMax)}
          >
            <IconPencil size={18} />
          </ActionIcon>
        </Flex>
        {isEditingSellMax ? (
          <Flex align="center">
            <TextInput
              size="sm"
              w="6rem"
              value={sellMaxValue}
              onChange={(e) => setSellMaxValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSellMaxSubmit()}
              placeholder="Max"
            />
          </Flex>
        ) : (
          <Text mt="xs">{sellMax || "N/A"}</Text>
        )}
      </Card>

      <Card withBorder>
        <Flex align="center" gap="xs">
          <Text fw={600} c="dimmed">
            Sell Min
          </Text>
          <ActionIcon
            size="xs"
            variant="subtle"
            onClick={() => setIsEditingSellMin(!isEditingSellMin)}
          >
            <IconPencil size={18} />
          </ActionIcon>
        </Flex>
        {isEditingSellMin ? (
          <Flex align="center">
            <TextInput
              size="sm"
              w="6rem"
              value={sellMinValue}
              onChange={(e) => setSellMinValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSellMinSubmit()}
              placeholder="Min"
            />
          </Flex>
        ) : (
          <Text mt="xs">{sellMin || "N/A"}</Text>
        )}
      </Card>
    </SimpleGrid>
  );
}
