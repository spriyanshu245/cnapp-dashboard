import { BsInboxes } from 'react-icons/bs';

/**
 * Friendly empty state for "filters match nothing" (and similar).
 */
export default function EmptyState({ title = 'No vehicles match', message, onClear }) {
  return (
    <div className="chart-enter flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-900/60 px-6 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-gray-100 dark:bg-gray-800">
        <BsInboxes className="text-2xl text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">{message}</p>
      {onClear && (
        <button
          onClick={onClear}
          className="mt-5 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
