/** 클래스 이름을 합칩니다. false, null, undefined 는 무시합니다. */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
