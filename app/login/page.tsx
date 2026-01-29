// components/Login.js
"use client";

import LoginForm from "@/components/LoginForm";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("¡Inicio de sesión exitoso!");
    }
  };

  return (
    <div>
      <h2>Iniciar sesión</h2>
      <LoginForm
        handleLogin={handleLogin}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
		/>
      {message && <p>{message}</p>}
    </div>
  );
}
