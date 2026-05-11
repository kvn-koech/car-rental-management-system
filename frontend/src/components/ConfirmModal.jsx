import { useState, useCallback } from 'react';

/**
 * Lightweight styled confirm modal to replace window.confirm().
 *
 * Usage:
 *   const { confirmModal, requestConfirm } = useConfirm();
 *   // In JSX: {confirmModal}
 *   // Trigger: const ok = await requestConfirm('Are you sure?');
 */
export function useConfirm() {
  const [state, setState] = useState({ open: false, message: '', resolve: null });

  const requestConfirm = useCallback((message) => {
    return new Promise((resolve) => {
      setState({ open: true, message, resolve });
    });
  }, []);

  const handleResponse = (answer) => {
    state.resolve(answer);
    setState({ open: false, message: '', resolve: null });
  };

  const confirmModal = state.open ? (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-sm p-6 animate-fadeIn">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Confirm Action</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{state.message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => handleResponse(false)}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => handleResponse(true)}
            className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { confirmModal, requestConfirm };
}
