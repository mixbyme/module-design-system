import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 버튼의 시각적 강조 수준 */
  variant?: ButtonVariant;
  /** 버튼 크기 */
  size?: ButtonSize;
  /** 로딩 중이면 스피너를 보여주고 클릭을 막습니다 */
  loading?: boolean;
  /** 부모 너비를 꽉 채웁니다 */
  fullWidth?: boolean;
  /** 텍스트 앞에 놓을 아이콘 */
  leftIcon?: ReactNode;
  /** 텍스트 뒤에 놓을 아이콘 */
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    disabled,
    type = 'button',
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        'ds-button',
        `ds-button--${variant}`,
        `ds-button--${size}`,
        fullWidth && 'ds-button--full',
        loading && 'ds-button--loading',
        className,
      )}
      {...rest}
    >
      {loading ? <span className="ds-button__spinner" aria-hidden="true" /> : leftIcon}
      {children != null && <span className="ds-button__label">{children}</span>}
      {!loading && rightIcon}
    </button>
  );
});
