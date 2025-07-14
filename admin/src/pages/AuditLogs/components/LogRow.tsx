import React from 'react';

import { Tr, Td, Typography } from '@strapi/design-system';
import { LogEntry } from './InteractiveLogRows';

function LogRow({
  entry,
  visibleColumns,
  onClickHandler,
  style,
}: {
  entry: any;
  visibleColumns: any;
  onClickHandler: any;
  style?: any;
}) {
  return (
    <Tr key={entry.id} onClick={() => onClickHandler(entry)} style={style}>
      {visibleColumns
        .filter((column: any) => column.visible)
        .map((column: any) => (
          <Td>
            <Typography textColor="neutral800" fontWeight="bold" ellipsis>
              {column.id === 'createdAt'
                ? new Date(entry[column.id]).toUTCString()
                : entry[column.id]}
            </Typography>
          </Td>
        ))}
    </Tr>
  );
}

export default LogRow;
