import { Translations } from "../utils/translations";

interface GuidePopupProps {
  onClose: () => void;
  t: Translations;
}

export default function GuidePopup({ onClose, t }: GuidePopupProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-6 shadow-xl max-w-md w-full relative border border-gray-700">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl"
          title="Close Guide"
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-4 text-white">{t.keyboardShortcuts}</h2>
        <ul className="space-y-2 text-gray-300">
          <li><kbd className="inline-block px-2 py-1 bg-gray-700 rounded text-sm font-mono mr-2">H</kbd> {t.toggleTopControls}</li>
          <li><kbd className="inline-block px-2 py-1 bg-gray-700 rounded text-sm font-mono mr-2">F</kbd> {t.toggleFullscreenGuide}</li>
          <li><kbd className="inline-block px-2 py-1 bg-gray-700 rounded text-sm font-mono mr-2">G</kbd> {t.toggleGridGallery}</li>
          <li><kbd className="inline-block px-2 py-1 bg-gray-700 rounded text-sm font-mono mr-2">1</kbd>-<kbd className="inline-block px-2 py-1 bg-gray-700 rounded text-sm font-mono">9</kbd> {t.focusVideo}</li>
          <li><kbd className="inline-block px-2 py-1 bg-gray-700 rounded text-sm font-mono mr-2">Esc</kbd> {t.unfocusVideo}</li>
        </ul>
        <p className="mt-4 text-sm text-gray-400">
          {t.guideNote}
        </p>
      </div>
    </div>
  );
} 