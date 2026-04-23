import type { CategorySlug } from './categories';

type ViewMode = 'landing' | 'gallery';

interface State { view: ViewMode; activeCategory: CategorySlug | null; }

const state: State = { view: 'landing', activeCategory: null };
const listeners = new Set<(s: State) => void>();

export const getState = (): Readonly<State> => Object.freeze({ ...state });
export const setView = (v: ViewMode) => { state.view = v; notify(); };
export const setActiveCategory = (s: CategorySlug | null) => { state.activeCategory = s; notify(); };
export const subscribe = (l: (s: State) => void) => { listeners.add(l); return () => listeners.delete(l); };

function notify() { const snap = getState(); listeners.forEach(l => l(snap)); }
