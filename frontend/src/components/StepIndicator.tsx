import { useApp } from '../context/AppContext';

const STEPS = [
  { label: '填写仓库', icon: '1' },
  { label: '选择模板', icon: '2' },
  { label: '生成内容', icon: '3' },
  { label: '编辑发布', icon: '4' },
];

export default function StepIndicator() {
  const { state } = useApp();

  // Determine current step
  let currentStep = 0; // repo input
  if (state.repoInfo) currentStep = 1; // repo loaded
  if (state.repoInfo && state.selectedTemplate) currentStep = 2; // template selected
  if (state.sections.length > 0 || state.title) currentStep = 3; // generated

  return (
    <div className="mx-auto mt-8 max-w-2xl">
      <div className="flex items-center justify-between">
        {STEPS.map((step, i) => {
          const isCompleted = i < currentStep;
          const isCurrent = i === currentStep;

          return (
            <div key={step.label} className="flex flex-1 items-center">
              {/* Step circle + label */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-indigo-500 text-white'
                      : isCurrent
                      ? 'border-2 border-indigo-500 bg-indigo-50 text-indigo-600 animate-scale-up'
                      : 'border-2 border-gray-200 bg-white text-gray-300'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    step.icon
                  )}
                </div>
                <span
                  className={`mt-1 text-[10px] font-medium whitespace-nowrap ${
                    isCurrent ? 'text-indigo-600' : isCompleted ? 'text-gray-500' : 'text-gray-300'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line (not after last step) */}
              {i < STEPS.length - 1 && (
                <div className={`mx-2 h-px flex-1 ${i < currentStep ? 'bg-indigo-400' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
