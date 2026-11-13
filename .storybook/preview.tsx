import type { Preview } from '@storybook/react-vite';
import '../src/styles.css';

const preview: Preview = {
  globalTypes: {
    theme: {
      description: '테마',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme ?? 'light';
      document.documentElement.dataset.theme = theme;
      return (
        <div className="ds-root" style={{ padding: 24, background: 'var(--ds-color-bg)', minHeight: '100%' }}>
          <Story />
        </div>
      );
    },
  ],
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
  },
};

export default preview;
