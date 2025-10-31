'use client';

import { Toaster as SonnerToaster } from 'sonner';

export default function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'white',
          color: '#374151',
          border: '1px solid #e5e7eb',
        },
      }}
    />
  );
}
