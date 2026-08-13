import { TextInput } from 'react-native';

export const getFocusedInput = () => TextInput.State?.currentlyFocusedInput?.();
