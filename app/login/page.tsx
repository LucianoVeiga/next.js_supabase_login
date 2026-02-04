"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Step = "email" | "code";

export default function Login() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const sendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
    });

    setLoading(false);

    if (error) {
      setError("No pudimos enviar el código. Intenta nuevamente.");
      return;
    }

    setStep("code");
  };

  const verifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    setLoading(false);

    if (error) {
      setError("Código inválido o expirado.");
      return;
    }

    router.push("/");
  };

  return (
    <div>
      <h2>Iniciar sesión</h2>

      {step === "email" && (
        <form onSubmit={sendOtp}>
          <input
            type="email"
            placeholder="Ingresa tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar código"}
          </button>

          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
      )}

      {step === "code" && (
        <form onSubmit={verifyOtp}>
          <input
            type="text"
            placeholder="Código de verificación"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Verificando..." : "Verificar código"}
          </button>

          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
      )}
    </div>
  );
}
