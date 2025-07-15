// @ts-nocheck
import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import { Filter } from '@strapi/icons';
import { Filters } from '@strapi/strapi/admin';
import { Button, Box } from '@strapi/design-system';

import getTrad from '../../../utils/getTrad';

function TableFilters({ displayedFilters }: { displayedFilters: Array<any> }) {
  const { formatMessage } = useIntl();

  return (
    <Filters.Root schema={displayedFilters && displayedFilters}>
      {/* Trigger MUST be the direct child */}
      <Filters.Trigger asChild>
        <Box paddingTop={1} paddingBottom={1}>
          <Button variant="tertiary" startIcon={<Filter />} size="S">
            {formatMessage({
              id: getTrad('content.filter.label'),
              defaultMessage: 'Filters',
            })}
          </Button>
        </Box>
      </Filters.Trigger>

      {/* Popover with filter form */}
      <Filters.Popover />

      {/* Active-filters pill list */}
      <Filters.List />
    </Filters.Root>
  );
}

TableFilters.propTypes = {
  displayedFilters: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      metadatas: PropTypes.shape({ label: PropTypes.string }),
      schema: PropTypes.shape({ type: PropTypes.string }), // updated nesting
    })
  ).isRequired,
};

export default TableFilters;
