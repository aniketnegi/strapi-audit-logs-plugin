import React from 'react';

import { Tr, Td, Typography } from '@strapi/design-system';

interface LogEntry {
  createdAt: string | number | Date;
  documentId?: string;
  http_method?: string;
  http_status?: number;
  id?: number;
  ip_address?: string;
  locale?: string;
  publishedAt?: string | null;
  request_body?: any;
  response_body?: any;
  updatedAt?: string;
  url?: string;
  user?: string;
}

interface VisibleColumn {
  name: string;
}

function LogRow({
  entry,
  visibleColumns,
  onClickHandler,
  style,
}: {
  entry: LogEntry;
  visibleColumns: Array<VisibleColumn>;
  onClickHandler: (entry: LogEntry) => void;
  style?: any;
}) {
  // Early return if no entry
  if (!entry) return null;

  return (
    <Tr key={entry.id} onClick={() => onClickHandler(entry)} style={style}>
      {visibleColumns &&
        visibleColumns.map((column: { name: string }) => (
          <Td key={column.name} style={{ width: 'auto' }}>
            <Typography textColor="neutral800" fontWeight="bold" ellipsis>
              {column.name === 'createdAt'
                ? new Date(entry[column.name]).toUTCString()
                : // @ts-ignore
                  entry[column.name] || 'N/A'}
            </Typography>
          </Td>
        ))}
    </Tr>
  );
}

export default LogRow;
