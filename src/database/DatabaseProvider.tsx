// ============================================================
// Luna — Database Provider
// Thin wrapper around expo-sqlite's SQLiteProvider with
// automatic migration on initialization.
// ============================================================

import React, { Suspense } from 'react';
import { SQLiteProvider } from 'expo-sqlite';
import { View, ActivityIndicator } from 'react-native';
import { initializeDatabase } from './migrations';

const DATABASE_NAME = 'luna.db';

function LoadingFallback() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#6b9080" />
    </View>
  );
}

interface DatabaseProviderProps {
  children: React.ReactNode;
}

/**
 * Wraps the app in expo-sqlite's SQLiteProvider.
 * Runs database migrations on first init via onInit callback.
 *
 * Usage in app/_layout.tsx:
 * ```tsx
 * <DatabaseProvider>
 *   <Stack />
 * </DatabaseProvider>
 * ```
 */
export function DatabaseProvider({ children }: DatabaseProviderProps) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SQLiteProvider
        databaseName={DATABASE_NAME}
        onInit={initializeDatabase}
        useSuspense
      >
        {children}
      </SQLiteProvider>
    </Suspense>
  );
}