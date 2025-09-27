import React, { useState } from 'react';
import './Table.css';

export const Table = ({
  data,
  columns,
  loading = false,
  emptyText = 'Нет данных',
  size = 'md',
  variant = 'default',
  className = '',
  onRowClick,
  onSort,
  sortColumn,
  sortDirection,
  pagination,
  selection,
  rowKey = 'id',
  expandable,
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  const getRowKey = (record, index) => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey]?.toString() || index.toString();
  };

  const handleSort = (column) => {
    if (!column.sortable || !onSort) return;

    const newDirection = 
      sortColumn === column.key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(column, newDirection);
  };

  const handleSelectAll = (checked) => {
    if (!selection) return;
    
    const allKeys = data.map((record, index) => getRowKey(record, index));
    const selectedKeys = checked ? allKeys : [];
    const selectedRows = checked ? data : [];
    
    selection.onChange(selectedKeys, selectedRows);
  };

  const handleSelectRow = (record, index, checked) => {
    if (!selection) return;

    const key = getRowKey(record, index);
    const newSelectedKeys = checked
      ? [...selection.selectedRowKeys, key]
      : selection.selectedRowKeys.filter(k => k !== key);
    
    const newSelectedRows = data.filter((_, i) => 
      newSelectedKeys.includes(getRowKey(_, i))
    );
    
    selection.onChange(newSelectedKeys, newSelectedRows);
  };

  const isRowSelected = (record, index) => {
    if (!selection) return false;
    const key = getRowKey(record, index);
    return selection.selectedRowKeys.includes(key);
  };

  const isAllSelected = () => {
    if (!selection || data.length === 0) return false;
    return selection.selectedRowKeys.length === data.length;
  };

  const isIndeterminate = () => {
    if (!selection) return false;
    return selection.selectedRowKeys.length > 0 && selection.selectedRowKeys.length < data.length;
  };

  const baseClasses = 'table';
  const sizeClass = `table--${size}`;
  const variantClass = `table--${variant}`;
  const loadingClass = loading ? 'table--loading' : '';

  const classes = [
    baseClasses,
    sizeClass,
    variantClass,
    loadingClass,
    className,
  ].filter(Boolean).join(' ');

  if (loading) {
    return (
      <div className="table-container">
        <div className={classes}>
          <div className="table-loading">
            <div className="table-loading__spinner" />
            <div className="table-loading__text">Загрузка...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className={classes}>
        <thead className="table__head">
          <tr className="table__row">
            {selection && (
              <th className="table__cell table__cell--selection">
                <input
                  type="checkbox"
                  checked={isAllSelected()}
                  ref={(input) => {
                    if (input) input.indeterminate = isIndeterminate();
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="table__checkbox"
                />
              </th>
            )}
            {expandable && (
              <th className="table__cell table__cell--expand"></th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className={`table__cell ${column.className || ''}`}
                style={{ 
                  width: column.width,
                  textAlign: column.align || 'left',
                }}
              >
                <div className="table__cell-content">
                  <span className="table__cell-title">{column.title}</span>
                  {column.sortable && onSort && (
                    <button
                      type="button"
                      className={`table__sort ${
                        sortColumn === column.key ? `table__sort--${sortDirection}` : ''
                      }`}
                      onClick={() => handleSort(column)}
                    >
                      <svg className="table__sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M3 6h18M3 12h18M3 18h18" />
                      </svg>
                    </button>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="table__body">
          {data.length === 0 ? (
            <tr className="table__row">
              <td 
                className="table__cell table__cell--empty" 
                colSpan={columns.length + (selection ? 1 : 0) + (expandable ? 1 : 0)}
              >
                <div className="table__empty">
                  <div className="table__empty-icon">📋</div>
                  <div className="table__empty-text">{emptyText}</div>
                </div>
              </td>
            </tr>
          ) : (
            data.map((record, index) => {
              const key = getRowKey(record, index);
              const isSelected = isRowSelected(record, index);
              const isExpanded = expandable?.expandedRowKeys.includes(key);
              const isHovered = hoveredRow === index;

              return (
                <React.Fragment key={key}>
                  <tr
                    className={`table__row ${isSelected ? 'table__row--selected' : ''} ${isHovered ? 'table__row--hovered' : ''}`}
                    onClick={() => onRowClick?.(record, index)}
                    onMouseEnter={() => setHoveredRow(index)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {selection && (
                      <td className="table__cell table__cell--selection">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(record, index, e.target.checked)}
                          className="table__checkbox"
                          {...selection.getCheckboxProps?.(record)}
                        />
                      </td>
                    )}
                    {expandable && (
                      <td className="table__cell table__cell--expand">
                        <button
                          type="button"
                          className={`table__expand ${isExpanded ? 'table__expand--expanded' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            const newExpandedKeys = isExpanded
                              ? expandable.expandedRowKeys.filter(k => k !== key)
                              : [...expandable.expandedRowKeys, key];
                            expandable.onExpandedRowsChange(newExpandedKeys);
                          }}
                        >
                          <svg className="table__expand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="9,18 15,12 9,6" />
                          </svg>
                        </button>
                      </td>
                    )}
                    {columns.map((column) => {
                      const value = column.dataIndex ? record[column.dataIndex] : null;
                      const content = column.render ? column.render(record, index) : value;

                      return (
                        <td
                          key={column.key}
                          className={`table__cell ${column.className || ''}`}
                          style={{ textAlign: column.align || 'left' }}
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                  {expandable && isExpanded && (
                    <tr className="table__row table__row--expanded">
                      <td 
                        className="table__cell table__cell--expanded-content"
                        colSpan={columns.length + (selection ? 1 : 0) + 1}
                      >
                        {expandable.expandedRowRender(record, index)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
      
      {pagination && (
        <div className="table__pagination">
          <div className="table__pagination-info">
            Показано {((pagination.current - 1) * pagination.pageSize) + 1} - {Math.min(pagination.current * pagination.pageSize, pagination.total)} из {pagination.total}
          </div>
          <div className="table__pagination-controls">
            <button
              type="button"
              className="table__pagination-button"
              disabled={pagination.current === 1}
              onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
            >
              Назад
            </button>
            <span className="table__pagination-current">
              Страница {pagination.current}
            </span>
            <button
              type="button"
              className="table__pagination-button"
              disabled={pagination.current * pagination.pageSize >= pagination.total}
              onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
            >
              Вперед
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
