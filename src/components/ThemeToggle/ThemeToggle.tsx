import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { useTheme, type ThemeSetting } from '../../theme/ThemeProvider';
import { cx } from '../../utils/cx';

const SunIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20.5 14.1A8.5 8.5 0 0 1 9.9 3.5 8.5 8.5 0 1 0 20.5 14.1Z" />
  </svg>
);
const SystemIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M8 20h8M12 16v4" />
  </svg>
);

const icons: Record<ThemeSetting, ReactNode> = { light: <SunIcon />, system: <SystemIcon />, dark: <MoonIcon /> };
const defaultLabels: Record<ThemeSetting, string> = { light: '라이트', system: '시스템', dark: '다크' };

export interface ThemeToggleProps {
  /** segmented: 라이트·시스템·다크 중 선택 / icon: 라이트 ↔ 다크 아이콘 버튼 */
  variant?: 'segmented' | 'icon';
  /** segmented 에서 보여줄 선택지. 기본은 세 가지 모두 */
  options?: ThemeSetting[];
  /** 선택지 이름 (다국어용) */
  labels?: Partial<Record<ThemeSetting, string>>;
  /** segmented 에서 아이콘 옆에 이름을 함께 보여줍니다 */
  showLabels?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function ThemeToggle({
  variant = 'segmented',
  options = ['light', 'system', 'dark'],
  labels,
  showLabels = false,
  size = 'md',
  className,
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const groupRef = useRef<HTMLDivElement>(null);
  const names = { ...defaultLabels, ...labels };

  if (variant === 'icon') {
    const next: ThemeSetting = resolvedTheme === 'dark' ? 'light' : 'dark';
    return (
      <button
        type="button"
        className={cx('ds-theme-toggle', 'ds-theme-toggle--icon', `ds-theme-toggle--${size}`, className)}
        onClick={toggleTheme}
        aria-label={`${names[next]} 테마로 전환`}
        title={`${names[next]} 테마로 전환`}
      >
        {resolvedTheme === 'dark' ? <MoonIcon /> : <SunIcon />}
      </button>
    );
  }

  // 라디오 그룹 키보드 규칙: 화살표로 이동하며 바로 선택합니다.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const index = options.indexOf(theme);
    const next = options[(index + step + options.length) % options.length];
    setTheme(next);
    groupRef.current?.querySelector<HTMLButtonElement>(`[data-value="${next}"]`)?.focus();
  };

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label="테마"
      className={cx('ds-theme-toggle', 'ds-theme-toggle--segmented', `ds-theme-toggle--${size}`, className)}
      onKeyDown={onKeyDown}
    >
      {options.map((option) => {
        const checked = theme === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            data-value={option}
            aria-checked={checked}
            aria-label={showLabels ? undefined : names[option]}
            title={names[option]}
            tabIndex={checked || (!options.includes(theme) && option === options[0]) ? 0 : -1}
            className={cx('ds-theme-toggle__option', checked && 'ds-theme-toggle__option--checked')}
            onClick={() => setTheme(option)}
          >
            {icons[option]}
            {showLabels && <span>{names[option]}</span>}
          </button>
        );
      })}
    </div>
  );
}
