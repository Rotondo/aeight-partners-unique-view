import React, { useState } from "react";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de login, troque para sua lógica real!
    if (email === "admin@admin.com" && senha === "123456") {
      setMensagem("Login bem-sucedido!");
      // Redirecione ou faça autenticação real aqui
    } else {
      setMensagem("E-mail ou senha incorretos.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "10vh auto", padding: 32, border: "1px solid #eee", borderRadius: 8 }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email</label>
          <input
            style={{ width: "100%", marginBottom: 8, padding: 8 }}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Senha</label>
          <input
            style={{ width: "100%", marginBottom: 8, padding: 8 }}
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>
        <button type="submit" style={{ width: "100%", padding: 10 }}>Entrar</button>
      </form>
      {mensagem && <div style={{ marginTop: 16, color: mensagem.includes("sucesso") ? "green" : "red" }}>{mensagem}</div>}
    </div>
  );
};

export default LoginPage;
