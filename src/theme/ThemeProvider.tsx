import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { cx } from '../utils/cx';

/** 사용자가 고르는 테마. system 은 OS 설정을 따릅니다 */
export type ThemeSetting = 'light' | 'dark' | 'system';
/** 실제로 화면에 적용된 테마 */
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeContextValue {
  theme: ThemeSetting;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeSetting) => void;
  /** 라이트 ↔ 다크 전환 */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const DARK_QUERY = '(prefers-color-scheme: dark)';

const isSetting = (v: unknown): v is ThemeSetting => v === 'light' || v === 'dark' || v === 'system';

function getSystemTheme(): ResolvedTheme {
  return typeof window !== 'undefined' && window.matchMedia?.(DARK_QUERY).matches ? 'dark' : 'light';
}

function readStorage(key: string | null): ThemeSetting | null {
  if (!key) return null;
  try {
    const v = window.localStorage.getItem(key);
    return isSetting(v) ? v : null;
  } catch {
    return null;
  }
}

function writeStorage(key: string | null, value: ThemeSetting) {
  if (!key) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // 저장소를 쓸 수 없는 환경(시크릿 모드 등)에서는 기억하지 않고 넘어갑니다.
  }
}

export interface ThemeProviderProps {
  children: ReactNode;
  /** 처음 테마 (비제어). 저장된 값이 있으면 그 값을 씁니다 */
  defaultTheme?: ThemeSetting;
  /** 테마 (제어). 넘기면 내부 상태와 저장소 대신 이 값을 씁니다 */
  theme?: ThemeSetting;
  /** 테마가 바뀔 때 호출 */
  onThemeChange?: (theme: ThemeSetting) => void;
  /** 선택을 기억할 localStorage 키. null 이면 기억하지 않습니다 */
  storageKey?: string | null;
  /**
   * true 면 <html> 대신 이 Provider 가 그리는 영역에만 테마를 적용합니다.
   * 한 페이지에 여러 테마를 함께 보여줄 때 씁니다.
   */
  scoped?: boolean;
  /** scoped 영역에 붙일 클래스 */
  className?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  theme: themeProp,
  onThemeChange,
  storageKey = 'ds-theme',
  scoped = false,
  className,
}: ThemeProviderProps) {
  const [inner, setInner] = useState<ThemeSetting>(() => readStorage(storageKey) ?? defaultTheme);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);
  const theme = themeProp ?? inner;
  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme;

  // OS 테마가 바뀌면 따라갑니다.
  useEffect(() => {
    const mql = window.matchMedia?.(DARK_QUERY);
    if (!mql) return;
    const update = () => setSystemTheme(mql.matches ? 'dark' : 'light');
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  // 문서 전체 모드: <html data-theme> 를 바꾸고, 언마운트하면 원래 값으로 돌려놓습니다.
  useEffect(() => {
    if (scoped) return;
    const root = document.documentElement;
    const previous = root.dataset.theme;
    root.dataset.theme = resolvedTheme;
    return () => {
      if (previous) root.dataset.theme = previous;
      else delete root.dataset.theme;
    };
  }, [resolvedTheme, scoped]);

  const setTheme = useCallback(
    (next: ThemeSetting) => {
      if (themeProp === undefined) setInner(next);
      writeStorage(storageKey, next);
      onThemeChange?.(next);
    },
    [themeProp, storageKey, onThemeChange],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme: () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'),
    }),
    [theme, resolvedTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      {scoped ? (
        <div data-theme={resolvedTheme} className={cx('ds-theme-scope', className)}>
          {children}
        </div>
      ) : (
        children
      )}
    </ThemeContext.Provider>
  );
}

/** 현재 테마를 읽고 바꿉니다. ThemeProvider 안에서 사용해야 합니다 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme 은 <ThemeProvider> 안에서 사용해야 합니다.');
  return ctx;
}
