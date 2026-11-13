import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from '../Button';
import { cx } from '../../utils/cx';

export type MessageBoxTone = 'info' | 'success' | 'warning' | 'danger';

export interface MessageBoxProps {
  /** 열림 여부 (제어 컴포넌트) */
  open: boolean;
  /** 닫기 요청 시 호출 (Esc, 배경 클릭, 취소 버튼) */
  onClose: () => void;
  /** 제목 */
  title: ReactNode;
  /** 본문 메시지 */
  children?: ReactNode;
  /** 메시지 성격. 아이콘 색과 확인 버튼 스타일이 바뀝니다 */
  tone?: MessageBoxTone;
  /** 확인 버튼 문구 */
  confirmText?: ReactNode;
  /** 취소 버튼 문구. null 이면 취소 버튼을 숨깁니다 (알림창) */
  cancelText?: ReactNode | null;
  /** 확인 버튼 클릭 시 호출. 없으면 onClose 를 호출합니다 */
  onConfirm?: () => void;
  /** 확인 작업이 진행 중일 때 */
  confirmLoading?: boolean;
  /** 배경을 눌러 닫을 수 있는지 */
  closeOnBackdrop?: boolean;
  /** 기본 버튼 대신 넣을 하단 영역 */
  footer?: ReactNode;
  className?: string;
}

const icons: Record<MessageBoxTone, ReactNode> = {
  info: <path d="M12 16v-5M12 8h.01" />,
  success: <path d="M8 12.5l2.5 2.5L16 9.5" />,
  warning: <path d="M12 8v5M12 16h.01" />,
  danger: <path d="M9 9l6 6M15 9l-6 6" />,
};

export function MessageBox({
  open,
  onClose,
  title,
  children,
  tone = 'info',
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  confirmLoading = false,
  closeOnBackdrop = true,
  footer,
  className,
}: MessageBoxProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const bodyId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={cx('ds-messagebox', `ds-messagebox--${tone}`, className)}
      role={tone === 'danger' || tone === 'warning' ? 'alertdialog' : 'dialog'}
      aria-labelledby={titleId}
      aria-describedby={children ? bodyId : undefined}
      onCancel={(e) => {
        // Esc: 브라우저가 직접 닫지 않게 하고 상위 상태로 닫습니다.
        e.preventDefault();
        if (!confirmLoading) onClose();
      }}
      onClick={(e) => {
        if (closeOnBackdrop && !confirmLoading && e.target === e.currentTarget) onClose();
      }}
    >
      <div className="ds-messagebox__panel">
        <div className="ds-messagebox__header">
          <span className="ds-messagebox__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              {icons[tone]}
            </svg>
          </span>
          <h2 id={titleId} className="ds-messagebox__title">{title}</h2>
        </div>
        {children && <div id={bodyId} className="ds-messagebox__body">{children}</div>}
        <div className="ds-messagebox__footer">
          {footer ?? (
            <>
              {cancelText !== null && (
                <Button variant="secondary" onClick={onClose} disabled={confirmLoading}>
                  {cancelText}
                </Button>
              )}
              <Button
                variant={tone === 'danger' ? 'danger' : 'primary'}
                loading={confirmLoading}
                onClick={onConfirm ?? onClose}
                autoFocus
              >
                {confirmText}
              </Button>
            </>
          )}
        </div>
      </div>
    </dialog>
  );
}
