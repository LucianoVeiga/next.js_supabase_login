"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../app/utils/supabase/client";

type Step = "email" | "code";

export default function LoginForm() {
  const router = useRouter();
  const supabase = createClient();

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
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    })

    if (error) {
      setLoading(false)
      setError("Código inválido o expirado.")
      return
    }

    if (data.session) {
      const { data: userData } = await supabase
        .from("users")
        .select("rol")
        .eq("id", data.session.user.id)
        .single()

      // Si no existe en la tabla o no tiene rol válido
      if (!userData?.rol || !["admin", "supervisor"].includes(userData.rol)) {
        await supabase.auth.signOut()
        setLoading(false)
        setError("Este usuario no tiene permisos para acceder al sistema.")
        return
      }

      document.cookie = `user_role=${userData.rol}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`
      router.push("/dashboard")
    }
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
