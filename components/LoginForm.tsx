import { Dispatch, SetStateAction, FormEvent } from "react";

export default function LoginForm({
  handleLogin,
  email,
  setEmail,
  password,
  setPassword,
}: {
  handleLogin: (e: FormEvent<HTMLFormElement>) => Promise<void> | void;
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
  password: string;
  setPassword: Dispatch<SetStateAction<string>>;
}) {
  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Iniciar sesión</button>
    </form>
  );
}
