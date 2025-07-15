import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

import { Modal, Typography } from '@strapi/design-system';

import LogRow from './LogRow';
import LogModal from './LogModal';
import getTrad from '../../../utils/getTrad';

export interface LogEntry {
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

interface InteractiveLogRowsProps {
  entries: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
    results: Array<LogEntry>;
  };
  visibleColumns: Array<VisibleColumn>;
}

function InteractiveLogRows({ entries, visibleColumns }: InteractiveLogRowsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<LogEntry | {}>({});
  const { formatMessage } = useIntl();

  const onClickHandler = (entry: any) => {
    setSelectedEntry(entry);
    setIsVisible(true);
  };

  useEffect(() => {
    // console.log('Visible Changed!', selectedEntry);
  }, [selectedEntry]);

  return (
    <>
      {entries &&
        entries.results.map((entry, idx) => (
          <LogRow
            key={entry?.documentId || idx} // Use unique ID if available
            entry={entry}
            visibleColumns={visibleColumns}
            onClickHandler={onClickHandler}
            style={{
              cursor: 'pointer',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
            }}
          />
        ))}

      <Modal.Root open={isVisible} onOpenChange={setIsVisible}>
        <Modal.Content
          onEscapeKeyDown={() => setIsVisible(false)}
          onPointerDownOutside={() => setIsVisible(false)}
        >
          <Modal.Header>
            <Modal.Title>
              {formatMessage({
                id: getTrad('content.modal.title'),
                defaultMessage: 'Log entry',
              })}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedEntry && Object.keys(selectedEntry).length === 0 ? (
              <LogModal entry={selectedEntry} />
            ) : (
              <Typography>
                {formatMessage({
                  id: getTrad('content.modal.empty'),
                  defaultMessage: 'No log entry selected.',
                })}
              </Typography>
            )}
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
    </>
  );
}

export default InteractiveLogRows;
