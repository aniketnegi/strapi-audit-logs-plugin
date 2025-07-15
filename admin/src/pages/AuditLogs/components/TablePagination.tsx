import React from 'react';
import PropTypes from 'prop-types';
import { Box, Flex } from '@strapi/design-system';
import { Pagination } from '@strapi/strapi/admin';

function TablePagination({
  pagination,
}: {
  pagination: { page?: number; pageCount?: number; pageSize?: number; total?: number };
}) {
  const { page, pageCount, pageSize, total } = pagination;

  return (
    <Box paddingTop={4}>
      <Pagination.Root
        // @ts-ignore
        activePage={page}
        pageCount={pageCount}
        // Make sure these props are passed if needed
        defaultPageSize={pageSize}
      >
        <Flex alignItems="flex-end" justifyContent="space-between">
          <Pagination.PageSize
            // Pass available page sizes
            // @ts-ignore
            options={[10, 25, 50, 100]}
          />
          <Pagination.Links />
        </Flex>
      </Pagination.Root>
    </Box>
  );
}

// TablePagination.defaultProps = {
//   pagination: {
//     page: 1,
//     pageCount: 0,
//     pageSize: 10,
//     total: 0,
//   },
// };

// TablePagination.propTypes = {
//   pagination: PropTypes.shape({
//     page: PropTypes.number,
//     pageCount: PropTypes.number,
//     pageSize: PropTypes.number,
//     total: PropTypes.number,
//   }),
// };

export default TablePagination;
