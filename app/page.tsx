// pages/index.js
import Login from './login/page';
import Register from './register/page';

export default function Home() {
  return (
    <div>
      <h1>Mi App con Supabase</h1>
      <Login />
      <hr />
      <Register />
    </div>
  );
}
