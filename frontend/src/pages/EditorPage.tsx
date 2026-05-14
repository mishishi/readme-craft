import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import EditWorkspace from '../components/EditWorkspace';
import StepIndicator from '../components/StepIndicator';
import ConfirmBackModal from '../components/ConfirmBackModal';

export default function EditorPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  const handleBack = () => {
    const hasContent = state.sections.some(s => s.content.trim());
    if (hasContent) {
      setShowBackConfirm(true);
    } else {
      dispatch({ type: 'CLEAR_CONTENT' });
      navigate('/');
    }
  };

  const confirmBack = () => {
    dispatch({ type: 'CLEAR_CONTENT' });
    setShowBackConfirm(false);
    navigate('/');
  };

  return (
    <section>
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-3">
          <h2 className="text-lg font-semibold text-muted-900">编辑 & 预览</h2>
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-xs text-muted-500 transition-colors hover:text-muted-600"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            返回首页
          </button>
        </div>
        <p className="mt-1 text-sm text-muted-500">
          调整标题和章节内容，右侧实时预览效果
        </p>
      </div>

      <StepIndicator />

      <EditWorkspace />

      <ConfirmBackModal
        open={showBackConfirm}
        onClose={() => setShowBackConfirm(false)}
        onConfirm={confirmBack}
      />
    </section>
  );
}
