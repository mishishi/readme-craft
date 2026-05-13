import Modal from './Modal';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/** 通用「确认返回」弹窗 — 编辑内容将丢失时的确认对话框 */
export default function ConfirmBackModal({ open, onClose, onConfirm }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="确认返回"
      confirmText="确认返回"
      confirmClassName="inline-flex items-center justify-center gap-2 rounded-button bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-amber-700"
    >
      <p className="mb-6 text-sm text-muted-500">当前编辑内容将丢失，确定要返回吗？</p>
    </Modal>
  );
}
