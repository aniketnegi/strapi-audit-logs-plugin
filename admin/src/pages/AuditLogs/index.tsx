import { stringify } from 'qs';
import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import _ from 'lodash';

import {
  EmptyStateLayout,
  useNotifyAT,
  Table,
  Thead,
  Tr,
  Th,
  Typography,
  Button,
  Flex,
} from '@strapi/design-system';
import { Download } from '@strapi/icons';

import { useQueryParams, useNotification, Page } from '@strapi/strapi/admin';
import { Layouts } from '@strapi/admin/strapi-admin';
import pluginId from '../../pluginId';

import { SearchInput, useFetchClient } from '@strapi/strapi/admin';

import PERMISSIONS from '../../constants';
import fetchLogs from './utils/api';
import getTrad from '../../utils/getTrad';
import InteractiveLogRows, { LogEntry } from './components/InteractiveLogRows';
import TablePagination from './components/TablePagination';
// import filterSchema from './utils/filterSchema';
import TableFilters from './components/TableFilters';

/* RBAC wrapper */
const ProtectedLogs = () => (
  // <Page.Protect permissions={PERMISSIONS.readLogs}>
  <Logs />
  // </Page.Protect>
);

export default ProtectedLogs;

const Logs = () => {
  const initialColumns = [
    'id',
    'user',
    'ip_address',
    'url',
    'http_method',
    'http_status',
    'createdAt',
  ];
  const [visibleColumns] = useState<{ name: string }[]>(initialColumns.map((name) => ({ name })));
  const [{ query: queryParams }, setQuery] = useQueryParams();
  const navigate = useNavigate();
  const { formatMessage } = useIntl();
  const { toggleNotification } = useNotification();
  const { notifyStatus } = useNotifyAT();
  const { get } = useFetchClient();
  const [entries, setEntries] = useState({
    results: [],
    pagination: { page: 1, pageSize: 10, pageCount: 0, total: 0 },
  });
  const [isFetching, setIsFetching] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Download handler function
  const handleDownload = async (format = 'csv') => {
    setIsDownloading(true);
    try {
      // Fetch ALL logs for download (not just current page)
      const downloadParams = {
        ...queryParams,
        pageSize: entries.pagination.total, // Get all records
        page: 1,
      };

      const response = await get(
        `/${pluginId}/logs/export?${stringify(downloadParams)}&format=${format}`
      );

      // console.log('RESPONSE ::', response.data);

      if (format === 'csv') {
        downloadCSV(response.data.data, 'audit-logs.csv');
      } else {
        downloadJSON(response.data, 'audit-logs.json');
      }

      toggleNotification({
        type: 'success',
        message: formatMessage({
          id: getTrad('download.success'),
          defaultMessage: 'Logs downloaded successfully',
        }),
      });
    } catch (error) {
      toggleNotification({
        type: 'danger',
        message: formatMessage({
          id: getTrad('download.error'),
          defaultMessage: 'Failed to download logs',
        }),
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // CSV download helper
  const downloadCSV = (data: any, filename: string) => {
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON download helper
  const downloadJSON = (data: any, filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Convert data to CSV format
  const convertToCSV = (data: any) => {
    // console.log('data ::', data);
    if (!data || data.length === 0) return '';

    const headers = [
      'ID',
      'User',
      'IP Address',
      'URL',
      'Method',
      'Status',
      'Created At',
      'Request Body',
      'Response Body',
    ];
    const csvRows = [headers.join(',')];

    data.forEach((log: LogEntry) => {
      // console.log('log ::', log);
      const row = [
        log.id,
        `"${log.user || 'Anonymous'}"`,
        log.ip_address,
        `"${log.url}"`,
        log.http_method,
        log.http_status,
        log.createdAt,
        log.request_body ? `"${JSON.stringify(log.request_body).replace(/"/g, '""')}"` : '',
        log.response_body ? `"${JSON.stringify(log.response_body.data).replace(/"/g, '""')}"` : '',
      ];
      // console.log(row);
      csvRows.push(row.join(','));
    });

    // console.log(csvRows);

    return csvRows.join('\n');
  };

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setIsFetching(true);
      try {
        const data = await fetchLogs(queryParams);
        if (ignore) return;

        // Validate data structure
        const safeData = {
          results: Array.isArray(data?.result?.results) ? data.result.results : [],
          pagination: data?.result?.pagination || { page: 1, pageSize: 10, pageCount: 0, total: 0 },
        };

        setEntries(safeData);
      } catch (error) {
        console.error('Failed to load logs:', error);
        // Set safe fallback state
        setEntries({
          results: [],
          pagination: { page: 1, pageSize: 10, pageCount: 0, total: 0 },
        });
      } finally {
        if (!ignore) setIsFetching(false);
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [queryParams]);

  const emptyContent = {
    logs: formatMessage({
      id: getTrad('content.empty'),
      defaultMessage: "You don't have any logs yet.",
    }),
    search: formatMessage({
      id: getTrad('content.empty.search'),
      defaultMessage: 'No logs match the search.',
    }),
  };

  // console.log('ENTRIES ::', entries);
  // console.log('VISIBLE COLUMNS ::', visibleColumns);

  return (
    // @ts-ignore
    <Page.Main labelledBy="title" aria-busy={isFetching}>
      <Page.Title
        // @ts-ignore
        title={formatMessage({
          id: getTrad('title'),
          defaultMessage: 'Audit Logs',
        })}
      />

      {!entries ? (
        <Page.Loading />
      ) : (
        <>
          <Layouts.Header
            title={formatMessage({
              id: getTrad('title'),
              defaultMessage: 'Audit Logs',
            })}
            subtitle={`${entries.pagination.total} ${formatMessage({
              id: getTrad('subtitle'),
              defaultMessage: 'entries found',
            })}`}
            primaryAction={
              <Flex gap={2}>
                <Button
                  startIcon={<Download />}
                  onClick={() => handleDownload('csv')}
                  loading={isDownloading}
                  disabled={_.isEmpty(entries.results)}
                >
                  {formatMessage({
                    id: getTrad('download.csv'),
                    defaultMessage: 'Download CSV',
                  })}
                </Button>
              </Flex>
            }
          />

          {isFetching ? (
            <Layouts.Content>
              <Page.Loading />
            </Layouts.Content>
          ) : _.isEmpty(entries.results) ? (
            <EmptyStateLayout content={emptyContent.logs} />
          ) : (
            <>
              <Layouts.Content>
                <Table
                  colCount={visibleColumns && visibleColumns.length}
                  rowCount={entries.pagination.total}
                >
                  <Thead>
                    <Tr>
                      {visibleColumns &&
                        visibleColumns.map(({ name }) => (
                          <Th key={name}>
                            <Typography variant="sigma">
                              {formatMessage({
                                id: getTrad(`content.${name.toLowerCase()}`),
                                defaultMessage: name.replace('_', ' '),
                              })}
                            </Typography>
                          </Th>
                        ))}
                    </Tr>
                  </Thead>
                  <InteractiveLogRows entries={entries} visibleColumns={visibleColumns} />
                </Table>
                <TablePagination pagination={{ pageCount: entries.pagination?.pageCount || 1 }} />
              </Layouts.Content>
            </>
          )}
        </>
      )}
    </Page.Main>
  );
};
