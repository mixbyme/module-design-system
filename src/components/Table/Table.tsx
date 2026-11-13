import { useMemo, useState, type Key, type ReactNode } from 'react';
import { Checkbox } from '../Checkbox';
import { cx } from '../../utils/cx';

export type SortDirection = 'asc' | 'desc';
export interface SortState {
  key: string;
  direction: SortDirection;
}

export interface TableColumn<T> {
  /** 컬럼 식별자. render 가 없으면 row[key] 를 보여줍니다 */
  key: string;
  /** 헤더에 보일 내용 */
  header: ReactNode;
  /** 셀 내용을 직접 그립니다 */
  render?: (row: T, index: number) => ReactNode;
  /** 정렬 가능 여부. true 면 row[key] 로 비교하고, 함수를 주면 그 값으로 비교합니다 */
  sortable?: boolean | ((row: T) => string | number);
  align?: 'left' | 'center' | 'right';
  width?: number | string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  /** 각 행의 고유 키 */
  rowKey: keyof T | ((row: T) => Key);
  /** 행 밀도 */
  size?: 'sm' | 'md';
  /** 줄무늬 배경 */
  striped?: boolean;
  /** 데이터가 없을 때 보여줄 내용 */
  emptyText?: ReactNode;
  /** 표 설명 (스크린리더용 caption) */
  caption?: ReactNode;

  /** 정렬 상태 (제어). 넘기지 않으면 내부에서 관리합니다 */
  sort?: SortState | null;
  defaultSort?: SortState | null;
  onSortChange?: (sort: SortState | null) => void;

  /** 행 선택 체크박스를 보여줍니다 */
  selectable?: boolean;
  selectedKeys?: Key[];
  onSelectionChange?: (keys: Key[]) => void;

  onRowClick?: (row: T) => void;
  className?: string;
}

function getValue<T>(row: T, key: string): unknown {
  return (row as Record<string, unknown>)[key];
}

export function Table<T>({
  columns,
  data,
  rowKey,
  size = 'md',
  striped = false,
  emptyText = '데이터가 없습니다',
  caption,
  sort: sortProp,
  defaultSort = null,
  onSortChange,
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  onRowClick,
  className,
}: TableProps<T>) {
  const [innerSort, setInnerSort] = useState<SortState | null>(defaultSort);
  const sort = sortProp !== undefined ? sortProp : innerSort;

  const keyOf = (row: T): Key => (typeof rowKey === 'function' ? rowKey(row) : (row[rowKey] as Key));

  const rows = useMemo(() => {
    if (!sort) return data;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortable) return data;
    const pick = typeof col.sortable === 'function' ? col.sortable : (r: T) => getValue(r, col.key) as string | number;
    const dir = sort.direction === 'asc' ? 1 : -1;
    return [...data].sort((a, b) => {
      const va = pick(a);
      const vb = pick(b);
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      return String(va ?? '').localeCompare(String(vb ?? ''), 'ko') * dir;
    });
  }, [data, columns, sort]);

  const toggleSort = (key: string) => {
    // 오름차순 → 내림차순 → 정렬 해제 순서로 바뀝니다.
    const next: SortState | null =
      sort?.key !== key ? { key, direction: 'asc' } : sort.direction === 'asc' ? { key, direction: 'desc' } : null;
    if (sortProp === undefined) setInnerSort(next);
    onSortChange?.(next);
  };

  const allKeys = rows.map(keyOf);
  const selectedSet = new Set(selectedKeys);
  const selectedCount = allKeys.filter((k) => selectedSet.has(k)).length;
  const allSelected = allKeys.length > 0 && selectedCount === allKeys.length;

  const toggleAll = () => onSelectionChange?.(allSelected ? [] : allKeys);
  const toggleRow = (key: Key) =>
    onSelectionChange?.(selectedSet.has(key) ? selectedKeys.filter((k) => k !== key) : [...selectedKeys, key]);

  return (
    <div className={cx('ds-table', `ds-table--${size}`, striped && 'ds-table--striped', className)}>
      <table className="ds-table__table">
        {caption && <caption className="ds-visually-hidden">{caption}</caption>}
        <thead>
          <tr>
            {selectable && (
              <th className="ds-table__select" scope="col">
                <Checkbox
                  aria-label="전체 선택"
                  checked={allSelected}
                  indeterminate={selectedCount > 0 && !allSelected}
                  onChange={toggleAll}
                />
              </th>
            )}
            {columns.map((col) => {
              const active = sort?.key === col.key;
              const ariaSort = active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined;
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={col.sortable ? ariaSort ?? 'none' : undefined}
                  style={{ width: col.width, textAlign: col.align }}
                >
                  {col.sortable ? (
                    <button type="button" className={cx('ds-table__sort', active && 'ds-table__sort--active')} onClick={() => toggleSort(col.key)}>
                      {col.header}
                      <svg viewBox="0 0 16 16" aria-hidden="true" className={cx('ds-table__sort-icon', active && `ds-table__sort-icon--${sort.direction}`)}>
                        <path d="M5 6.5L8 3.5l3 3" />
                        <path d="M5 9.5l3 3 3-3" />
                      </svg>
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="ds-table__empty" colSpan={columns.length + (selectable ? 1 : 0)}>
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => {
              const key = keyOf(row);
              const selected = selectedSet.has(key);
              return (
                <tr
                  key={key}
                  aria-selected={selectable ? selected : undefined}
                  className={cx(selected && 'ds-table__row--selected', onRowClick && 'ds-table__row--clickable')}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {selectable && (
                    <td className="ds-table__select" onClick={(e) => e.stopPropagation()}>
                      <Checkbox aria-label={`${i + 1}번째 행 선택`} checked={selected} onChange={() => toggleRow(key)} />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} style={{ textAlign: col.align }}>
                      {col.render ? col.render(row, i) : (getValue(row, col.key) as ReactNode)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
