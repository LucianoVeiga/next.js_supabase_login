// components/Register.js
"use client";

import RegisterForm from "@/components/RegisterForm";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [message, setMessage] = useState("");

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("¡Registro exitoso! Revisa tu email para confirmar.");
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
    }
  };

  return (
    <div>
      <h2>Registrarse</h2>
      <RegisterForm
        handleSignUp={handleSignUp}
        firstName={firstName}
        setFirstName={setFirstName}
        lastName={lastName}
        setLastName={setLastName}
        setEmail={setEmail}
        setPassword={setPassword}
        email={email}
        password={password}
      />
      {message && <p>{message}</p>}
    </div>
  );
}
