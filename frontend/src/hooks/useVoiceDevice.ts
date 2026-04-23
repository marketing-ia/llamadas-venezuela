import { useEffect, useRef, useState, useCallback } from 'react';
import { Device, Call } from '@twilio/voice-sdk';
import { apiClient } from '../services/api';

export type DeviceState = 'unregistered' | 'registering' | 'registered' | 'error';

export interface IncomingCallInfo {
  call: Call;
  from: string;
}

export function useVoiceDevice() {
  const deviceRef = useRef<Device | null>(null);
  const [deviceState, setDeviceState] = useState<DeviceState>('unregistered');
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [incoming, setIncoming] = useState<IncomingCallInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(async () => {
    if (deviceRef.current) return; // already initialized
    setDeviceState('registering');
    try {
      const { token } = await apiClient.getVoiceToken();

      const device = new Device(token, {
        logLevel: 1,
        codecPreferences: ['opus', 'pcmu'] as any,
      });

      device.on('registered', () => setDeviceState('registered'));
      device.on('unregistered', () => setDeviceState('unregistered'));
      device.on('error', (err: any) => {
        setError(err.message);
        setDeviceState('error');
      });

      device.on('incoming', (call: Call) => {
        const from = call.parameters?.From ?? 'Desconocido';
        setIncoming({ call, from });
        call.on('disconnect', () => setIncoming(null));
        call.on('cancel', () => setIncoming(null));
      });

      deviceRef.current = device;
      await device.register();
    } catch (err: any) {
      deviceRef.current?.destroy();
      deviceRef.current = null;
      setError(err.error ?? err.message ?? 'Error al registrar el dispositivo de voz');
      setDeviceState('error');
    }
  }, []);

  // Call outbound number via Voice SDK (browser audio)
  const startCall = useCallback(async (toNumber: string): Promise<Call> => {
    if (!deviceRef.current) throw new Error('Dispositivo no registrado');
    const call = await deviceRef.current.connect({ params: { To: toNumber } });
    setActiveCall(call);
    call.on('disconnect', () => setActiveCall(null));
    call.on('cancel', () => setActiveCall(null));
    return call;
  }, []);

  const hangUp = useCallback(() => {
    activeCall?.disconnect();
    setActiveCall(null);
  }, [activeCall]);

  const acceptIncoming = useCallback(() => {
    if (!incoming) return;
    incoming.call.accept();
    setActiveCall(incoming.call);
    incoming.call.on('disconnect', () => {
      setActiveCall(null);
      setIncoming(null);
    });
    setIncoming(null);
  }, [incoming]);

  const rejectIncoming = useCallback(() => {
    incoming?.call.reject();
    setIncoming(null);
  }, [incoming]);

  // Refresh token before it expires (every 50 minutes)
  useEffect(() => {
    const id = setInterval(async () => {
      if (!deviceRef.current) return;
      try {
        const { token } = await apiClient.getVoiceToken();
        deviceRef.current.updateToken(token);
      } catch {
        // non-fatal
      }
    }, 50 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    return () => {
      deviceRef.current?.destroy();
      deviceRef.current = null;
    };
  }, []);

  return {
    deviceState,
    activeCall,
    incoming,
    error,
    register,
    startCall,
    hangUp,
    acceptIncoming,
    rejectIncoming,
  };
}
