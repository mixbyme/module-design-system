import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MessageBox, type MessageBoxProps } from './MessageBox';
import { Button } from '../Button';

const meta = {
  title: 'Components/MessageBox',
  component: MessageBox,
  args: {
    open: false,
    onClose: () => {},
    title: '변경사항을 저장할까요?',
    children: '저장하지 않으면 지금까지 작업한 내용이 사라집니다.',
    tone: 'info',
  },
  argTypes: {
    tone: { control: 'inline-radio', options: ['info', 'success', 'warning', 'danger'] },
    open: { control: false },
    onClose: { control: false },
  },
} satisfies Meta<typeof MessageBox>;

export default meta;
type Story = StoryObj<typeof meta>;

function Demo({ buttonLabel = '메시지박스 열기', ...args }: MessageBoxProps & { buttonLabel?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>{buttonLabel}</Button>
      <MessageBox {...args} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export const Playground: Story = { render: (args) => <Demo {...args} /> };

export const Alert: Story = {
  name: '알림 (확인 버튼만)',
  args: { tone: 'success', title: '저장되었습니다', children: '변경사항이 반영되었습니다.', cancelText: null },
  render: (args) => <Demo {...args} />,
};

export const Destructive: Story = {
  name: '삭제 확인',
  render: (args) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    return (
      <>
        <Button variant="danger" onClick={() => setOpen(true)}>프로젝트 삭제</Button>
        <MessageBox
          {...args}
          tone="danger"
          title="프로젝트를 삭제할까요?"
          confirmText="삭제"
          open={open}
          confirmLoading={loading}
          onClose={() => setOpen(false)}
          onConfirm={() => {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              setOpen(false);
            }, 1200);
          }}
        >
          삭제한 프로젝트는 되돌릴 수 없습니다.
        </MessageBox>
      </>
    );
  },
};

export const AllTones: Story = {
  name: '톤별 보기',
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {(['info', 'success', 'warning', 'danger'] as const).map((tone) => (
        <Demo key={tone} {...args} tone={tone} buttonLabel={tone} />
      ))}
    </div>
  ),
};
