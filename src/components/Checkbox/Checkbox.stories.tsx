import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: { label: '이용약관에 동의합니다' },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };
export const WithDescription: Story = { args: { label: '마케팅 수신 동의', description: '이벤트와 할인 소식을 이메일로 받습니다.' } };
export const Error: Story = { args: { error: '필수 항목입니다.' } };
export const Disabled: Story = { args: { disabled: true, defaultChecked: true } };

const fruits = ['사과', '바나나', '포도'];

export const SelectAll: Story = {
  name: '전체 선택 (indeterminate)',
  render: () => {
    const [selected, setSelected] = useState<string[]>(['사과']);
    const all = selected.length === fruits.length;
    const some = selected.length > 0 && !all;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Checkbox
          label="전체 선택"
          checked={all}
          indeterminate={some}
          onChange={() => setSelected(all ? [] : fruits)}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 26 }}>
          {fruits.map((f) => (
            <Checkbox
              key={f}
              label={f}
              checked={selected.includes(f)}
              onChange={(e) => setSelected((s) => (e.target.checked ? [...s, f] : s.filter((x) => x !== f)))}
            />
          ))}
        </div>
      </div>
    );
  },
};
