import React from 'react';
import { render, screen } from '@testing-library/react';
import ResultsTable from './ResultsTable';
import { translations } from '../../i18n';

const makeRows = (count, startId = 1) =>
  Array.from({ length: count }, (_, index) => ({
    id: startId + index,
    nombre: `Row ${startId + index}`,
  }));

const defaultPagination = {
  page: 0,
  rowsPerPage: 5,
  totalResults: 10,
  currentFrom: 1,
  currentTo: 5,
};

describe('ResultsTable pagination rendering', () => {
  it('renders all rows on page 0 without client-side slicing', () => {
    render(
      <ResultsTable
        queryResult={makeRows(5)}
        pagination={defaultPagination}
        onPageChange={jest.fn()}
        onRowsPerPageChange={jest.fn()}
      />
    );

    expect(screen.getAllByRole('row')).toHaveLength(6);
    expect(screen.getByText('Row 1')).toBeInTheDocument();
    expect(screen.getByText('Row 5')).toBeInTheDocument();
  });

  it('renders server-paginated rows on page 1 without client-side slicing', () => {
    render(
      <ResultsTable
        queryResult={makeRows(5, 6)}
        pagination={{
          ...defaultPagination,
          page: 1,
          currentFrom: 6,
          currentTo: 10,
        }}
        onPageChange={jest.fn()}
        onRowsPerPageChange={jest.fn()}
      />
    );

    expect(screen.getAllByRole('row')).toHaveLength(6);
    expect(screen.getByText('Row 6')).toBeInTheDocument();
    expect(screen.getByText('Row 10')).toBeInTheDocument();
  });

  it('shows no-results message when queryResult is empty', () => {
    render(
      <ResultsTable
        queryResult={[]}
        pagination={defaultPagination}
        onPageChange={jest.fn()}
        onRowsPerPageChange={jest.fn()}
      />
    );

    expect(screen.getByText(translations.es.NO_RESULTS)).toBeInTheDocument();
  });
});
