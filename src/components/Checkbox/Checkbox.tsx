import { forwardRef, useEffect, useId, useImperativeHandle, useRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** 체크박스 옆에 보이는 라벨 */
  label?: ReactNode;
  /** 라벨 아래 보조 설명 */
  description?: ReactNode;
  /** 일부만 선택된 상태 (전체 선택 체크박스 등) */
  indeterminate?: boolean;
  /** 오류 메시지. 있으면 오류 상태로 표시됩니다 */
  error?: ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, indeterminate = false, error, disabled, id, className, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const descId = description ? `${inputId}-desc` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const innerRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

  // indeterminate 는 HTML 속성이 아니라 DOM 프로퍼티라 직접 설정합니다.
  useEffect(() => {
    if (innerRef.current) innerRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <div className={cx('ds-checkbox', disabled && 'ds-checkbox--disabled', error != null && 'ds-checkbox--error', className)}>
      <span className="ds-checkbox__control">
        <input
          ref={innerRef}
          id={inputId}
          type="checkbox"
          className="ds-checkbox__input"
          disabled={disabled}
          aria-invalid={error != null || undefined}
          aria-describedby={cx(descId, errorId) || undefined}
          {...rest}
        />
        <svg className="ds-checkbox__icon ds-checkbox__icon--check" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg className="ds-checkbox__icon ds-checkbox__icon--dash" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M4 8h8" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
        </svg>
      </span>
      {(label || description || error) && (
        <span className="ds-checkbox__text">
          {label && <label htmlFor={inputId} className="ds-checkbox__label">{label}</label>}
          {description && <span id={descId} className="ds-checkbox__description">{description}</span>}
          {error && <span id={errorId} className="ds-checkbox__error">{error}</span>}
        </span>
      )}
    </div>
  );
});
