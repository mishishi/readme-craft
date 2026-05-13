import { useRepo } from '../context/RepoContext';

function Skeleton() {
  return (
    <div className="mx-auto mt-4 max-w-2xl">
      <div className="animate-pulse card flex items-center gap-4 !py-3">
        <div className="h-10 w-10 rounded-button bg-muted-200" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-48 rounded bg-muted-200" />
          <div className="h-3 w-72 rounded bg-muted-100" />
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="h-3 w-12 rounded bg-muted-100" />
          <div className="h-3 w-10 rounded bg-muted-100" />
        </div>
      </div>
    </div>
  );
}

export default function RepoInfoCard() {
  const { state } = useRepo();
  if (state.repoLoading) return <Skeleton />;
  if (!state.repoInfo) return null;

  const { repoInfo } = state;

  const formatStars = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
  };

  return (
    <div className="mx-auto mt-4 max-w-2xl">
      <div className="animate-fade-in-up card flex items-center gap-4 !py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-button bg-primary-100 text-lg font-bold text-primary-600">
          {repoInfo.name.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <a
              href={repoInfo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-sm font-semibold text-muted-900 hover:text-primary-600"
            >
              {repoInfo.fullName}
            </a>
          </div>
          <p className="truncate text-xs text-muted-500">
            {repoInfo.description || '暂无描述'}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3 text-xs text-muted-500">
          {repoInfo.language && (
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-primary-400" />
              {repoInfo.language}
            </span>
          )}
          <span className="flex items-center gap-0.5">
            <svg className="h-3.5 w-3.5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {formatStars(repoInfo.stars)}
          </span>
          {repoInfo.license && <span>{repoInfo.license}</span>}
        </div>
      </div>

      {repoInfo.topics.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {repoInfo.topics.map((topic) => (
            <span
              key={topic}
              className="rounded-md bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-600"
            >
              {topic}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
