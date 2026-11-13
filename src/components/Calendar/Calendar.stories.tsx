import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Calendar, type CalendarProps, type DateRange } from './Calendar';
import { addDays, toKey } from './dateUtils';

const today = new Date();
const muted = { color: 'var(--ds-color-text-muted)' };
const fmt = (d: Date | null) => (d ? d.toLocaleDateString('ko-KR') : '-');

/** 선택 모드 관련 props를 빼고 공통 props만 남깁니다 */
function baseOf(args: CalendarProps) {
  const { mode: _mode, value: _value, defaultValue: _defaultValue, onChange: _onChange, ...rest } = args;
  return rest;
}

const meta = {
  title: 'Components/Calendar',
  component: Calendar,
  args: { onChange: fn(), onMonthChange: fn() },
  argTypes: {
    weekStartsOn: { control: 'inline-radio', options: [0, 1] },
    locale: { control: 'inline-radio', options: ['ko-KR', 'en-US', 'ja-JP'] },
    mode: { control: false },
    value: { control: false },
    defaultValue: { control: false },
    month: { control: false },
    defaultMonth: { control: false },
    minDate: { control: false },
    maxDate: { control: false },
    today: { control: false },
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Single: Story = {
  name: '날짜 선택',
  render: (args) => {
    const [value, setValue] = useState<Date | null>(today);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Calendar {...baseOf(args)} mode="single" value={value} onChange={setValue} />
        <span style={muted}>선택한 날짜: {fmt(value)}</span>
      </div>
    );
  },
};

export const Range: Story = {
  name: '기간 선택',
  render: (args) => {
    const [range, setRange] = useState<DateRange>({ start: addDays(today, -3), end: addDays(today, 4) });
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Calendar {...baseOf(args)} mode="range" value={range} onChange={setRange} />
        <span style={muted}>
          {fmt(range.start)} ~ {fmt(range.end)}
        </span>
      </div>
    );
  },
};

export const MinMax: Story = {
  name: '선택 가능 범위 (오늘부터 30일)',
  args: { minDate: today, maxDate: addDays(today, 30) },
};

export const DisabledWeekends: Story = {
  name: '주말 선택 불가',
  args: { isDateDisabled: (d: Date) => d.getDay() === 0 || d.getDay() === 6 },
};

export const MondayStart: Story = { name: '월요일 시작', args: { weekStartsOn: 1 } };
export const English: Story = { name: '영어 표기', args: { locale: 'en-US' } };
export const HideOutsideDays: Story = { name: '다른 달 날짜 숨기기', args: { showOutsideDays: false } };

const events = new Set([addDays(today, 1), addDays(today, 5), addDays(today, 12), addDays(today, -4)].map(toKey));

export const WithEvents: Story = {
  name: '일정 표시 (renderDay)',
  args: {
    renderDay: (d, state) => (
      <>
        {d.getDate()}
        {events.has(toKey(d)) && (
          <span
            aria-label="일정 있음"
            style={{
              position: 'absolute',
              top: 5,
              right: 7,
              width: 6,
              height: 6,
              borderRadius: 999,
              background: state.selected ? 'var(--ds-color-on-primary)' : 'var(--ds-color-warning)',
            }}
          />
        )}
      </>
    ),
  },
};
