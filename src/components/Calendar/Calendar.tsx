import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import {
  addDays,
  addMonths,
  compareDay,
  endOfMonth,
  getMonthGrid,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  toKey,
} from './dateUtils';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

/** renderDay 에 넘겨주는 날짜 상태 */
export interface CalendarDayState {
  selected: boolean;
  today: boolean;
  disabled: boolean;
  outside: boolean;
  inRange: boolean;
}

interface CalendarBaseProps {
  /** 보여줄 달 (제어). 넘기지 않으면 내부에서 관리합니다 */
  month?: Date;
  /** 처음 보여줄 달 (비제어). 없으면 선택된 날짜나 오늘이 있는 달 */
  defaultMonth?: Date;
  /** 이전/다음 달로 넘어갈 때 호출 */
  onMonthChange?: (month: Date) => void;
  /** 선택 가능한 가장 이른 날짜 */
  minDate?: Date;
  /** 선택 가능한 가장 늦은 날짜 */
  maxDate?: Date;
  /** true 를 돌려주는 날짜는 선택할 수 없습니다 (예: 주말, 공휴일) */
  isDateDisabled?: (date: Date) => boolean;
  /** 주의 시작 요일. 0 = 일요일, 1 = 월요일 */
  weekStartsOn?: 0 | 1;
  /** 월 이름, 요일 표기에 쓸 로케일 */
  locale?: string;
  /** 이전/다음 달 날짜를 흐리게 보여줄지 */
  showOutsideDays?: boolean;
  /** 날짜 칸 내용을 직접 그립니다 (일정 점 표시 등) */
  renderDay?: (date: Date, state: CalendarDayState) => ReactNode;
  /** 오늘 날짜 (테스트·스토리 고정용). 기본값은 실제 오늘 */
  today?: Date;
  className?: string;
}

export interface CalendarSingleProps extends CalendarBaseProps {
  /** 하나의 날짜를 선택합니다 */
  mode?: 'single';
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date) => void;
}

export interface CalendarRangeProps extends CalendarBaseProps {
  /** 시작일과 종료일을 차례로 눌러 기간을 선택합니다 */
  mode: 'range';
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (range: DateRange) => void;
}

export type CalendarProps = CalendarSingleProps | CalendarRangeProps;

const EMPTY_RANGE: DateRange = { start: null, end: null };

export function Calendar(props: CalendarProps) {
  const {
    month: monthProp,
    defaultMonth,
    onMonthChange,
    minDate,
    maxDate,
    isDateDisabled,
    weekStartsOn = 0,
    locale = 'ko-KR',
    showOutsideDays = true,
    renderDay,
    className,
  } = props;
  const today = startOfDay(props.today ?? new Date());

  // 선택 값 (단일 / 기간)
  const [innerSingle, setInnerSingle] = useState<Date | null>(props.mode !== 'range' ? props.defaultValue ?? null : null);
  const [innerRange, setInnerRange] = useState<DateRange>(props.mode === 'range' ? props.defaultValue ?? EMPTY_RANGE : EMPTY_RANGE);
  const single = props.mode !== 'range' ? (props.value !== undefined ? props.value : innerSingle) : null;
  const range = props.mode === 'range' ? props.value ?? innerRange : EMPTY_RANGE;
  const anchor = single ?? range.start;

  // 보여주는 달
  const [innerMonth, setInnerMonth] = useState(() => startOfMonth(defaultMonth ?? anchor ?? today));
  const month = startOfMonth(monthProp ?? innerMonth);
  const changeMonth = (next: Date) => {
    const m = startOfMonth(next);
    if (monthProp === undefined) setInnerMonth(m);
    onMonthChange?.(m);
  };

  // 키보드 포커스 위치 (roving tabindex)
  const [focused, setFocused] = useState<Date>(() => startOfDay(anchor ?? today));
  const [hovered, setHovered] = useState<Date | null>(null);
  const gridRef = useRef<HTMLTableElement>(null);
  const shouldFocus = useRef(false);

  const isDisabled = (d: Date) =>
    (!!minDate && compareDay(d, minDate) < 0) || (!!maxDate && compareDay(d, maxDate) > 0) || !!isDateDisabled?.(d);

  const weeks = useMemo(() => getMonthGrid(month, weekStartsOn), [month.getTime(), weekStartsOn]);
  const tabbable = isSameMonth(focused, month) ? focused : weeks.flat().find((d) => isSameMonth(d, month) && !isDisabled(d)) ?? month;

  useEffect(() => {
    if (!shouldFocus.current) return;
    shouldFocus.current = false;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${toKey(focused)}"]`)?.focus();
  }, [focused, month.getTime()]);

  const formatters = useMemo(
    () => ({
      title: new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long' }),
      weekdayShort: new Intl.DateTimeFormat(locale, { weekday: 'short' }),
      weekdayLong: new Intl.DateTimeFormat(locale, { weekday: 'long' }),
      full: new Intl.DateTimeFormat(locale, { dateStyle: 'full' }),
    }),
    [locale],
  );
  // 2023-01-01 은 일요일입니다. 여기서부터 요일 이름을 만듭니다.
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2023, 0, 1 + ((i + weekStartsOn) % 7)));

  const select = (d: Date) => {
    if (isDisabled(d)) return;
    if (!isSameMonth(d, month)) changeMonth(d);
    setFocused(d);
    if (props.mode === 'range') {
      let next: DateRange;
      if (!range.start || range.end) next = { start: d, end: null };
      else if (compareDay(d, range.start) < 0) next = { start: d, end: range.start };
      else next = { start: range.start, end: d };
      if (props.value === undefined) setInnerRange(next);
      props.onChange?.(next);
    } else {
      if (props.value === undefined) setInnerSingle(d);
      props.onChange?.(d);
    }
  };

  const moveFocus = (next: Date) => {
    if (minDate && compareDay(next, minDate) < 0) next = startOfDay(minDate);
    if (maxDate && compareDay(next, maxDate) > 0) next = startOfDay(maxDate);
    shouldFocus.current = true;
    setFocused(next);
    if (!isSameMonth(next, month)) changeMonth(next);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTableElement>) => {
    const dayOfWeek = (focused.getDay() - weekStartsOn + 7) % 7;
    const keys: Record<string, () => Date> = {
      ArrowLeft: () => addDays(focused, -1),
      ArrowRight: () => addDays(focused, 1),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      Home: () => addDays(focused, -dayOfWeek),
      End: () => addDays(focused, 6 - dayOfWeek),
      PageUp: () => addMonths(focused, e.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focused, e.shiftKey ? 12 : 1),
    };
    const action = keys[e.key];
    if (!action) return;
    e.preventDefault();
    moveFocus(action());
  };

  const goMonth = (delta: number) => {
    const next = addMonths(month, delta);
    changeMonth(next);
    setFocused(startOfMonth(next));
  };
  const prevDisabled = !!minDate && compareDay(endOfMonth(addMonths(month, -1)), minDate) < 0;
  const nextDisabled = !!maxDate && compareDay(addMonths(month, 1), maxDate) > 0;

  // 기간 선택 중이면 마우스를 올린 날짜까지 미리 보여줍니다.
  const rangeEnd = range.end ?? (range.start && hovered ? hovered : null);
  const [rangeFrom, rangeTo] =
    range.start && rangeEnd && compareDay(rangeEnd, range.start) < 0 ? [rangeEnd, range.start] : [range.start, rangeEnd];

  return (
    <div className={cx('ds-calendar', props.mode === 'range' && 'ds-calendar--range', className)}>
      <div className="ds-calendar__header">
        <button type="button" className="ds-calendar__nav" onClick={() => goMonth(-1)} disabled={prevDisabled} aria-label="이전 달">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3.5L5.5 8l4.5 4.5" /></svg>
        </button>
        <h2 className="ds-calendar__title" aria-live="polite">{formatters.title.format(month)}</h2>
        <button type="button" className="ds-calendar__nav" onClick={() => goMonth(1)} disabled={nextDisabled} aria-label="다음 달">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.5L10.5 8 6 12.5" /></svg>
        </button>
      </div>

      <table ref={gridRef} role="grid" className="ds-calendar__grid" aria-label={formatters.title.format(month)} onKeyDown={onKeyDown}>
        <thead>
          <tr>
            {weekdays.map((d) => (
              <th key={d.getDay()} scope="col" abbr={formatters.weekdayLong.format(d)} className={cx('ds-calendar__weekday', d.getDay() === 0 && 'ds-calendar__weekday--sun', d.getDay() === 6 && 'ds-calendar__weekday--sat')}>
                {formatters.weekdayShort.format(d)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody onMouseLeave={() => setHovered(null)}>
          {weeks.map((week) => (
            <tr key={toKey(week[0])}>
              {week.map((d) => {
                const outside = !isSameMonth(d, month);
                if (outside && !showOutsideDays) return <td key={toKey(d)} className="ds-calendar__cell" />;

                const disabled = isDisabled(d);
                const isStart = isSameDay(d, rangeFrom);
                const isEnd = isSameDay(d, rangeTo);
                const inRange = !!rangeFrom && !!rangeTo && compareDay(d, rangeFrom) >= 0 && compareDay(d, rangeTo) <= 0;
                const selected = props.mode === 'range' ? isSameDay(d, range.start) || isSameDay(d, range.end) : isSameDay(d, single);
                const isToday = isSameDay(d, today);
                const state: CalendarDayState = { selected, today: isToday, disabled, outside, inRange };

                return (
                  <td
                    key={toKey(d)}
                    role="gridcell"
                    aria-selected={selected || (props.mode === 'range' && inRange) || undefined}
                    className={cx(
                      'ds-calendar__cell',
                      inRange && 'ds-calendar__cell--in-range',
                      inRange && isStart && !isEnd && 'ds-calendar__cell--range-start',
                      inRange && isEnd && !isStart && 'ds-calendar__cell--range-end',
                    )}
                  >
                    <button
                      type="button"
                      data-date={toKey(d)}
                      tabIndex={isSameDay(d, tabbable) ? 0 : -1}
                      disabled={disabled}
                      aria-label={formatters.full.format(d)}
                      aria-current={isToday ? 'date' : undefined}
                      className={cx(
                        'ds-calendar__day',
                        outside && 'ds-calendar__day--outside',
                        isToday && 'ds-calendar__day--today',
                        (selected || isStart || isEnd) && 'ds-calendar__day--selected',
                        d.getDay() === 0 && 'ds-calendar__day--sun',
                        d.getDay() === 6 && 'ds-calendar__day--sat',
                      )}
                      onClick={() => select(d)}
                      onMouseEnter={props.mode === 'range' ? () => setHovered(d) : undefined}
                      onFocus={() => setFocused(d)}
                    >
                      {renderDay ? renderDay(d, state) : d.getDate()}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
