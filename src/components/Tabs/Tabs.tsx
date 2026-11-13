import {
  createContext,
  useContext,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';

export type TabsVariant = 'line' | 'pill';

interface TabsContextValue {
  value: string;
  select: (value: string) => void;
  variant: TabsVariant;
  baseId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs(component: string) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error(`<${component}> 는 <Tabs> 안에서 사용해야 합니다.`);
  return ctx;
}

const toId = (base: string, kind: 'tab' | 'panel', value: string) => `${base}-${kind}-${value.replace(/\s+/g, '-')}`;

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** 선택된 탭 (제어) */
  value?: string;
  /** 처음 선택될 탭 (비제어) */
  defaultValue?: string;
  /** 탭이 바뀔 때 호출 */
  onValueChange?: (value: string) => void;
  /** 탭 모양 */
  variant?: TabsVariant;
  children: ReactNode;
}

export function Tabs({ value: valueProp, defaultValue = '', onValueChange, variant = 'line', className, children, ...rest }: TabsProps) {
  const [inner, setInner] = useState(defaultValue);
  const value = valueProp ?? inner;
  const baseId = useId();
  const select = (next: string) => {
    if (valueProp === undefined) setInner(next);
    onValueChange?.(next);
  };
  return (
    <TabsContext.Provider value={{ value, select, variant, baseId }}>
      <div className={cx('ds-tabs', `ds-tabs--${variant}`, className)} {...rest}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  /** 탭 목록의 접근성 이름 */
  'aria-label'?: string;
}

export function TabList({ className, children, ...rest }: TabListProps) {
  useTabs('TabList');
  const ref = useRef<HTMLDivElement>(null);

  // 화살표 / Home / End 로 비활성 탭을 건너뛰며 이동하고, 이동한 탭을 바로 선택합니다.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const tabs = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)') ?? []);
    const current = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (current < 0) return;
    let next = current;
    if (e.key === 'ArrowRight') next = (current + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    else return;
    e.preventDefault();
    tabs[next].focus();
    tabs[next].click();
  };

  return (
    <div ref={ref} role="tablist" className={cx('ds-tabs__list', className)} onKeyDown={onKeyDown} {...rest}>
      {children}
    </div>
  );
}

export interface TabProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'onClick'> {
  /** 이 탭의 값. TabPanel 의 value 와 짝을 이룹니다 */
  value: string;
  disabled?: boolean;
  /** 라벨 옆 아이콘이나 숫자 배지 */
  badge?: ReactNode;
  children: ReactNode;
}

export function Tab({ value, disabled, badge, className, children, ...rest }: TabProps) {
  const ctx = useTabs('Tab');
  const selected = ctx.value === value;
  return (
    <button
      type="button"
      role="tab"
      id={toId(ctx.baseId, 'tab', value)}
      aria-selected={selected}
      aria-controls={toId(ctx.baseId, 'panel', value)}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      className={cx('ds-tabs__tab', selected && 'ds-tabs__tab--selected', className)}
      onClick={() => ctx.select(value)}
      {...rest}
    >
      {children}
      {badge != null && <span className="ds-tabs__badge">{badge}</span>}
    </button>
  );
}

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  /** 선택되지 않아도 DOM 에 남겨둡니다 (상태 유지용) */
  keepMounted?: boolean;
}

export function TabPanel({ value, keepMounted = false, className, children, ...rest }: TabPanelProps) {
  const ctx = useTabs('TabPanel');
  const selected = ctx.value === value;
  if (!selected && !keepMounted) return null;
  return (
    <div
      role="tabpanel"
      id={toId(ctx.baseId, 'panel', value)}
      aria-labelledby={toId(ctx.baseId, 'tab', value)}
      hidden={!selected}
      tabIndex={0}
      className={cx('ds-tabs__panel', className)}
      {...rest}
    >
      {children}
    </div>
  );
}
