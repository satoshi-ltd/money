import { saveSettings } from './modules';

export const updateSettings = async (value, [state, setState]) => {
  const nextSettings = await saveSettings(state.store, value);

  setState((prev) => ({ ...prev, settings: nextSettings }));
};
