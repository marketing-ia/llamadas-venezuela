import { IncomingCallInfo } from '../hooks/useVoiceDevice';

interface Props {
  incoming: IncomingCallInfo;
  onAccept: () => void;
  onReject: () => void;
}

export function IncomingCall({ incoming, onAccept, onReject }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-slate-800 border border-green-500/50 rounded-2xl shadow-2xl p-5 animate-pulse-once">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white text-lg">
          📞
        </div>
        <div>
          <p className="text-white font-semibold text-sm">Llamada entrante</p>
          <p className="text-green-400 text-xs font-mono">{incoming.from}</p>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onAccept}
          className="flex-1 bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
        >
          Contestar
        </button>
        <button
          onClick={onReject}
          className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
        >
          Rechazar
        </button>
      </div>
    </div>
  );
}
