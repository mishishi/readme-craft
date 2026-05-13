/** 键盘无障碍：跳转到主内容 */
export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-2 focus:z-[100] focus:rounded-button focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-600 focus:shadow-lg focus:ring-2 focus:ring-primary-400 focus:outline-none"
    >
      跳转到主内容
    </a>
  );
}
