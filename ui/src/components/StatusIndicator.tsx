import { Box, Group, Text } from "@mantine/core";
import type { ConnectionStatus } from "../types";

interface StatusIndicatorProps {
  status: ConnectionStatus;
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  return (
    <Group gap="xs">
      <Box
        bg={status === "connected" ? "green" : "red"}
        w={10}
        h={10}
        size="lg"
        style={{ borderRadius: "50%" }}
      />
      <Text size="sm" fw={500}>
        {status === "connected" ? "Connected" : "Disconnected"}
      </Text>
    </Group>
  );
}
