import type { ReactNode } from 'react';
import { Alert, Spinner } from './Feedback';

interface QueryStateProps {
  isLoading: boolean;
  error: Error | null;
  children: ReactNode;
}

/** Wrap list content: shows a spinner while loading, the error message on failure, otherwise the children. */
export function QueryState({ isLoading, error, children }: QueryStateProps) {
  if (isLoading) return <Spinner />;
  if (error) return <Alert>{error.message}</Alert>;
  return <>{children}</>;
}
