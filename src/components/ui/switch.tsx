import { Switch as RNSwitch, type SwitchProps as RNSwitchProps } from 'react-native';

export type SwitchProps = RNSwitchProps;

export function Switch(props: SwitchProps) {
  return <RNSwitch {...props} />;
}