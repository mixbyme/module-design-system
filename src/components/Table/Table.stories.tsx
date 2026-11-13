import { useState, type Key } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table, type TableColumn } from './Table';

interface Member {
  id: number;
  name: string;
  team: string;
  role: string;
  joined: string;
  projects: number;
}

const members: Member[] = [
  { id: 1, name: '김민준', team: 'Frontend', role: 'Team Lead', joined: '2019-03-04', projects: 14 },
  { id: 2, name: '이서연', team: 'Frontend', role: 'Senior', joined: '2020-07-13', projects: 9 },
  { id: 3, name: '박도윤', team: 'Backend', role: 'Senior', joined: '2018-11-01', projects: 17 },
  { id: 4, name: '최지우', team: 'Design', role: 'Lead', joined: '2021-02-15', projects: 11 },
  { id: 5, name: '정하준', team: 'Frontend', role: 'Junior', joined: '2024-01-08', projects: 3 },
];

const columns: TableColumn<Member>[] = [
  { key: 'name', header: '이름', sortable: true },
  { key: 'team', header: '팀', sortable: true },
  { key: 'role', header: '직급' },
  { key: 'joined', header: '입사일', sortable: true },
  { key: 'projects', header: '프로젝트', sortable: true, align: 'right' },
];

const meta = {
  title: 'Components/Table',
  component: Table<Member>,
  args: { columns, data: members, rowKey: 'id', caption: '팀원 목록' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    columns: { control: false },
    data: { control: false },
    rowKey: { control: false },
  },
} satisfies Meta<typeof Table<Member>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Striped: Story = { args: { striped: true } };
export const Compact: Story = { args: { size: 'sm' } };
export const Empty: Story = { args: { data: [], emptyText: '검색 결과가 없습니다' } };

export const Selectable: Story = {
  name: '행 선택',
  render: (args) => {
    const [selected, setSelected] = useState<Key[]>([2]);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Table {...args} selectable selectedKeys={selected} onSelectionChange={setSelected} />
        <span style={{ color: 'var(--ds-color-text-muted)' }}>선택된 행: {selected.length}개</span>
      </div>
    );
  },
};

export const CustomRender: Story = {
  name: '셀 직접 그리기',
  args: {
    columns: [
      ...columns.slice(0, 2),
      {
        key: 'role',
        header: '직급',
        render: (row) => (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 999,
              fontSize: 12,
              background: 'var(--ds-color-primary-subtle)',
              color: 'var(--ds-color-primary)',
            }}
          >
            {row.role}
          </span>
        ),
      },
      { key: 'projects', header: '프로젝트', sortable: true, align: 'right', render: (row) => `${row.projects}건` },
    ],
  },
};
