'use client';

import { ErrorBoundary } from './ErrorBoundary';
import { ReactNode } from 'react';

interface ClientErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ClientErrorBoundary({ children, fallback }: ClientErrorBoundaryProps) {
  return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>;
}
