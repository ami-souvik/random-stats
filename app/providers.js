'use client';

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { store, persistor } from '@/src/store';
import { PersistGate } from 'redux-persist/integration/react';

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
