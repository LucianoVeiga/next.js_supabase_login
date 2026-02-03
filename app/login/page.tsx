// components/Login.js
"use client";

import LoginForm from "@/components/LoginForm";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({
      email,
    });

    setLoading(false)

    if (error) {
      setError('No pudimos enviar el código. Por favor, inténtalo de nuevo.');
      return
    }

    setStep("code");
  };
  
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email'
    })

    setLoading(false)

    if (error) {
      setError('Código inválido o expirado');
      return
    }

    router.push('/');
    console.log('Usuario autenticado');
    
  };

  return (
    <div>
      {step === "email" && (
      <form onSubmit={handleLogin}>
        <input
        type="text" 
        required  
        value={email}
        onChange={e => setEmail(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar código'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
      )}
      {step === "code" && (
      <form onSubmit={handleVerifyOtp}>
        <input 
        type="text"
        placeholder="Codigo de 6 digitos"
        value={code}
        onChange={e => setCode(e.target.value)}
        required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Verificando...' : 'Verificar código'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
      )}
      </div>

  );
}
