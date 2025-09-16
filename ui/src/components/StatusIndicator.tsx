import { Badge, Group, Text } from '@mantine/core';
import type { ConnectionStatus } from '../types';

interface StatusIndicatorProps {
  status: ConnectionStatus;
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  return (
    <Group gap="xs">
      <Badge 
        color={status === 'connected' ? 'green' : 'red'} 
        variant="dot" 
        size="lg"
      />
      <Text size="sm" fw={500}>
        {status === 'connected' ? 'Connected' : 'Disconnected'}
      </Text>
    </Group>
  );
}
