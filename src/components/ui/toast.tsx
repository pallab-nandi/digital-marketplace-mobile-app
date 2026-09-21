import { CheckCircle2, Info, AlertCircle } from 'lucide-react-native';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';

import { cn } from '@/utils/cn';

export type ToastType = 'success' | 'error' | 'info';
export type ToastInput = { message: string; type?: ToastType; title?: string };

type ToastContextValue = {
  show: (input: ToastInput) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const iconMap = {
  success: { Icon: CheckCircle2, color: '#16A34A' },
  error: { Icon: AlertCircle, color: '#DC2626' },
  info: { Icon: Info, color: '#2563EB' },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastInput | null>(null);
  const [opacity] = useState(() => new Animated.Value(0));
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() =>
      setToast(null),
    );
  }, [opacity]);

  const show = useCallback(
    (input: ToastInput) => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setToast(input);
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();
      hideTimer.current = setTimeout(dismiss, 3000);
    },
    [dismiss, opacity],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      success: (message: string) => show({ message, type: 'success' }),
      error: (message: string) => show({ message, type: 'error' }),
      info: (message: string) => show({ message, type: 'info' }),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <Animated.View
          pointerEvents="none"
          className="absolute top-12 left-4 right-4"
          style={{ opacity }}
        >
          {(() => {
            const { Icon, color } = iconMap[toast.type ?? 'info'];
            return (
              <View className="flex-row items-center gap-2.5 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg px-4 py-3 shadow-md">
                <Icon size={20} color={color} />
                <View className="flex-1">
                  {toast.title && (
                    <Text className="text-small font-semibold text-primary-text dark:text-primary-text-dark">
                      {toast.title}
                    </Text>
                  )}
                  <Text className={cn('text-small text-primary-text dark:text-primary-text-dark', toast.title && 'text-caption text-secondary-text dark:text-secondary-text-dark')}>
                    {toast.message}
                  </Text>
                </View>
              </View>
            );
          })()}
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}