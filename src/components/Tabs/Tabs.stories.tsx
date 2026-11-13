import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs, TabList, Tab, TabPanel } from './Tabs';

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  args: { defaultValue: 'overview', variant: 'line', children: null },
  argTypes: {
    variant: { control: 'inline-radio', options: ['line', 'pill'] },
    children: { control: false },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const Content = () => (
  <>
    <TabList aria-label="프로젝트 메뉴">
      <Tab value="overview">개요</Tab>
      <Tab value="issues" badge={12}>이슈</Tab>
      <Tab value="settings">설정</Tab>
      <Tab value="archived" disabled>보관됨</Tab>
    </TabList>
    <TabPanel value="overview">프로젝트의 진행 상황과 최근 활동을 보여줍니다.</TabPanel>
    <TabPanel value="issues">열려 있는 이슈 12건이 있습니다.</TabPanel>
    <TabPanel value="settings">프로젝트 이름, 권한, 알림을 설정합니다.</TabPanel>
  </>
);

export const Line: Story = { render: (args) => <Tabs {...args}><Content /></Tabs> };
export const Pill: Story = { args: { variant: 'pill' }, render: (args) => <Tabs {...args}><Content /></Tabs> };

export const Controlled: Story = {
  name: '제어 컴포넌트',
  render: (args) => {
    const [value, setValue] = useState('issues');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Tabs {...args} value={value} onValueChange={setValue}>
          <Content />
        </Tabs>
        <span style={{ color: 'var(--ds-color-text-muted)' }}>현재 탭: {value}</span>
      </div>
    );
  },
};
