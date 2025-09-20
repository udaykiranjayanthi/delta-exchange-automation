import {
  Card,
  Text,
  ActionIcon,
  TextInput,
  Flex,
  SimpleGrid,
  Box,
  Stack,
} from "@mantine/core";
import { IconPencil, IconChartLine, IconCards } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { PriceGraph } from "./PriceGraph";
import type { Position, Price } from "../types";
import { socket } from "../common/socket";

interface SummaryProps {
  prices: Record<string, Price>;
  positions: Position[];
  upperLimit: number | null;
  lowerLimit: number | null;
}

interface GraphData {
  currentPrice: number;
  timestamp: number;
}

export function Summary({
  prices,
  positions,
  upperLimit,
  lowerLimit,
}: SummaryProps) {
  const [showGraph, setShowGraph] = useState(false);
  const [graphData, setGraphData] = useState<GraphData[]>([]);

  const [isEditingUpperLimit, setIsEditingUpperLimit] = useState(false);
  const [isEditingLowerLimit, setIsEditingLowerLimit] = useState(false);
  const [upperLimitValue, setupperLimitValue] = useState<string>(
    upperLimit?.toString() || ""
  );
  const [lowerLimitValue, setLowerLimitValue] = useState<string>(
    lowerLimit?.toString() || ""
  );
  const [showPercentage, setShowPercentage] = useState(false);

  // Update local state when props change
  useEffect(() => {
    if (upperLimit !== null) setupperLimitValue(upperLimit.toString());
    if (lowerLimit !== null) setLowerLimitValue(lowerLimit.toString());
  }, [upperLimit, lowerLimit]);

  const invested = Object.values(positions).reduce(
    (acc, position) =>
      acc +
      position.size *
        parseFloat(position.product.contract_value) *
        parseFloat(position.entry_price),
    0
  );

  const currentValue = Object.values(positions).reduce((acc, position) => {
    const markPrice = parseFloat(
      prices[`MARK:${position.product_symbol}`]?.price
    );
    return (
      acc +
      position.size * parseFloat(position.product.contract_value) * markPrice
    );
  }, 0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (positions.length === 0) {
        setGraphData([]);
        return;
      }

      if (!isNaN(currentValue)) {
        setGraphData((prev) => [
          ...prev,
          { currentPrice: currentValue, timestamp: Date.now() },
        ]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [positions, currentValue]);

  const returns = currentValue - invested;

  const denominator = Object.values(positions).reduce(
    (acc, position) =>
      acc +
      Math.abs(position.size) *
        parseFloat(position.product.contract_value) *
        parseFloat(position.entry_price),
    0
  );

  const returnsPercentage = (returns / denominator) * 100;

  const upperLimitPercentage = upperLimit
    ? (((upperLimit - invested) / denominator) * 100).toFixed(2)
    : "N/A";

  const lowerLimitPercentage = lowerLimit
    ? (((lowerLimit - invested) / denominator) * 100).toFixed(2)
    : "N/A";

  const handleUpperLimitSubmit = () => {
    socket.emit("upperLimit", parseFloat(upperLimitValue));
    setIsEditingUpperLimit(false);
  };

  const handleLowerLimitSubmit = () => {
    socket.emit("lowerLimit", parseFloat(lowerLimitValue));
    setIsEditingLowerLimit(false);
  };

  return (
    <Stack>
      {showGraph ? (
        <PriceGraph
          graphData={graphData}
          investedValue={invested}
          upperLimit={upperLimit}
          lowerLimit={lowerLimit}
        />
      ) : (
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
          <Card withBorder onClick={() => setShowPercentage(!showPercentage)}>
            <Text fw={600} c="dimmed">
              Returns {showPercentage && "(%)"}
            </Text>
            <Text c={returns > 0 ? "green" : "red"} mt="xs">
              {showPercentage
                ? returnsPercentage.toFixed(2) + "%"
                : returns.toFixed(5)}
            </Text>
          </Card>
          <Card withBorder>
            <Flex align="center" gap="xs">
              <Text fw={600} c="dimmed">
                Upper Limit
              </Text>
              <ActionIcon
                size="xs"
                variant="subtle"
                onClick={() => setIsEditingUpperLimit(!isEditingUpperLimit)}
              >
                <IconPencil size={18} />
              </ActionIcon>
            </Flex>
            {isEditingUpperLimit ? (
              <Flex align="center">
                <TextInput
                  size="sm"
                  w="6rem"
                  value={upperLimitValue}
                  onChange={(e) => setupperLimitValue(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleUpperLimitSubmit()
                  }
                  placeholder="Max"
                />
              </Flex>
            ) : (
              <Text mt="xs">
                {upperLimit
                  ? `${upperLimit} (${upperLimitPercentage}%)`
                  : "N/A"}
              </Text>
            )}
          </Card>
          <Card withBorder>
            <Flex align="center" gap="xs">
              <Text fw={600} c="dimmed">
                Lower Limit
              </Text>
              <ActionIcon
                size="xs"
                variant="subtle"
                onClick={() => setIsEditingLowerLimit(!isEditingLowerLimit)}
              >
                <IconPencil size={18} />
              </ActionIcon>
            </Flex>
            {isEditingLowerLimit ? (
              <Flex align="center">
                <TextInput
                  size="sm"
                  w="6rem"
                  value={lowerLimitValue}
                  onChange={(e) => setLowerLimitValue(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleLowerLimitSubmit()
                  }
                  placeholder="Min"
                />
              </Flex>
            ) : (
              <Text mt="xs">
                {lowerLimit
                  ? `${lowerLimit} (${lowerLimitPercentage}%)`
                  : "N/A"}
              </Text>
            )}
          </Card>
        </SimpleGrid>
      )}
      <Box ta="right">
        <ActionIcon
          onClick={() => setShowGraph(!showGraph)}
          variant="subtle"
          size="lg"
          color="blue"
        >
          {showGraph ? <IconCards size={20} /> : <IconChartLine size={20} />}
        </ActionIcon>
      </Box>
    </Stack>
  );
}
