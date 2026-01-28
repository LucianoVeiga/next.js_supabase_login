// pages/index.js
import Register from '../components/Register';
import Login from '../components/Login';

export default function Home() {
  return (
    <div>
      <h1>Mi App con Supabase</h1>
      <Register />
      <hr />
      <Login />
    </div>
  );
}
