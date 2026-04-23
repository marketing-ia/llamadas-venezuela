import { createContext, useContext, ReactNode } from 'react';
import { Call } from '@twilio/voice-sdk';
import { useVoiceDevice, DeviceState, IncomingCallInfo } from '../hooks/useVoiceDevice';

interface VoiceDeviceContextType {
  deviceState: DeviceState;
  activeCall: Call | null;
  incoming: IncomingCallInfo | null;
  error: string | null;
  register: () => Promise<void>;
  startCall: (toNumber: string) => Promise<Call>;
  hangUp: () => void;
  acceptIncoming: () => void;
  rejectIncoming: () => void;
}

const VoiceDeviceContext = createContext<VoiceDeviceContextType | null>(null);

export function VoiceDeviceProvider({ children }: { children: ReactNode }) {
  const voice = useVoiceDevice();
  return (
    <VoiceDeviceContext.Provider value={voice}>
      {children}
    </VoiceDeviceContext.Provider>
  );
}

export function useVoiceContext() {
  const ctx = useContext(VoiceDeviceContext);
  if (!ctx) throw new Error('useVoiceContext must be inside VoiceDeviceProvider');
  return ctx;
}
