import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeToggle } from './ThemeToggle';
import { ThemeProvider, useTheme, type ThemeSetting } from '../../theme';
import { Button } from '../Button';
import { Checkbox } from '../Checkbox';
import { Tabs, TabList, Tab, TabPanel } from '../Tabs';

/*
 * 스토리에서는 Storybook 툴바 테마와 섞이지 않도록 scoped 모드를 쓰고,
 * 선택을 브라우저에 저장하지 않습니다 (storageKey={null}).
 * 실제 앱에서는 최상위에 <ThemeProvider> 하나만 두면 <html> 전체에 적용됩니다.
 */

const meta = {
  title: 'Theme/ThemeToggle',
  component: ThemeToggle,
  args: { variant: 'segmented', size: 'md', showLabels: false },
  argTypes: {
    variant: { control: 'inline-radio', options: ['segmented', 'icon'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
  decorators: [
    (Story) => (
      <ThemeProvider scoped storageKey={null} defaultTheme="light" className="ds-root">
        <div style={{ padding: 24, borderRadius: 12 }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Segmented: Story = {};
export const WithLabels: Story = { name: '이름 함께 보기', args: { showLabels: true } };
export const IconButton: Story = { name: '아이콘 버튼', args: { variant: 'icon' } };

function ThemeStatus() {
  const { theme, resolvedTheme } = useTheme();
  return (
    <span style={{ color: 'var(--ds-color-text-muted)' }}>
      선택: {theme} · 적용: {resolvedTheme}
    </span>
  );
}

function SampleCard() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        width: 340,
        padding: 20,
        border: '1px solid var(--ds-color-border)',
        borderRadius: 12,
        background: 'var(--ds-color-surface)',
      }}
    >
      <Tabs defaultValue="a" variant="pill">
        <TabList aria-label="샘플">
          <Tab value="a">개요</Tab>
          <Tab value="b">설정</Tab>
        </TabList>
        <TabPanel value="a">테마를 바꾸면 모든 컴포넌트 색이 함께 바뀝니다.</TabPanel>
        <TabPanel value="b">설정 화면</TabPanel>
      </Tabs>
      <Checkbox label="알림 받기" defaultChecked />
      <div style={{ display: 'flex', gap: 8 }}>
        <Button size="sm">저장</Button>
        <Button size="sm" variant="secondary">취소</Button>
      </div>
    </div>
  );
}

export const LivePreview: Story = {
  name: '앱에 적용한 모습',
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <ThemeToggle {...args} />
        <ThemeStatus />
      </div>
      <SampleCard />
    </div>
  ),
};

export const SideBySide: Story = {
  name: '영역별 테마',
  render: () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      {(['light', 'dark'] as ThemeSetting[]).map((t) => (
        <ThemeProvider key={t} scoped storageKey={null} defaultTheme={t} className="ds-root">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 20, borderRadius: 12 }}>
            <ThemeToggle variant="icon" />
            <SampleCard />
          </div>
        </ThemeProvider>
      ))}
    </div>
  ),
};
