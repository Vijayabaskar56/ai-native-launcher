import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { getDatabase, initializeDatabase, Database } from './connection';

interface DatabaseContextType {
  db: Database | null;
  isLoading: boolean;
  error: Error | null;
  reinitialize: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType>({
  db: null,
  isLoading: true,
  error: null,
  reinitialize: async () => {},
});

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Database | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const init = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const database = await initializeDatabase();
      setDb(database);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  const reinitialize = useCallback(async () => {
    await init();
  }, [init]);

  return (
    <DatabaseContext.Provider value={{ db, isLoading, error, reinitialize }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}
