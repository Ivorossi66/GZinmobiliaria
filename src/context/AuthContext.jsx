import React, { createContext, useState, useEffect, useContext } from 'react';
import  supabase  from '../supabaseClient';

// 1. Creamos el contexto
const AuthContext = createContext();

// 2. Creamos el Proveedor
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtenemos la sesión que ya exista
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Escuchamos cambios en la autenticación (Login / Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Los "value" son las funciones y variables que exponemos al resto de la app
  const value = {
    session,
    user: session?.user,
    signIn: (email, password) =>
      supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut(),
  };

  // Si no está cargando, muestra la app
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}