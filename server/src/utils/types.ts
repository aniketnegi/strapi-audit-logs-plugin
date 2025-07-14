export interface LogAge {
  value: number;
  interval: 'day' | 'week' | 'month' | 'year';
}

export interface LogCount {
  value: number;
}

export interface LogSettings {
  enabled: boolean;
  frequency: string;
  logAge: LogAge;
  logCount: LogCount;
}

export interface LogConfig {
  deletion: {
    enabled: boolean;
    frequency: 'logAge' | 'logCount';
    options: LogAge | LogCount;
  };
  filters: {
    endpoint: { exclude: [string] };
    status: {};
    method: { exclude: [string] };
  };
  redactedValues: [string];
}
