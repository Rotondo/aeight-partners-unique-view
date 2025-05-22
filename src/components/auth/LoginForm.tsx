import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/services/supabaseClient"; // ajuste o caminho se seu client estiver em lugar diferente

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      setMensagem("E-mail ou senha incorretos.");
      setLoading(false);
    } else {
      setMensagem("Login bem-sucedido! Redirecionando...");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    }
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: '18px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
      padding: '40px 36px 32px 36px',
      maxWidth: 380,
      width: '100%',
      textAlign: 'center',
      border: '1.5px solid #ececec'
    }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 4, color: '#22223b' }}>
          A&eight Partnership Hub
        </div>
        <div style={{
          color: '#475569',
          fontSize: '1.06rem',
          marginBottom: 20,
          lineHeight: 1.3
        }}>
          Plataforma Unificada de Parcerias<br />
          <strong>Exclusivo para integrantes e parceiros do Grupo A&eight</strong>
        </div>
      </div>
      <form className="login-form" autoComplete="on" onSubmit={handleLogin}>
        <label htmlFor="email" style={{
          display: 'block',
          textAlign: 'left',
          fontWeight: 600,
          marginBottom: 8,
          color: '#22223b',
          fontSize: '1.03rem'
        }}>Email</label>
        <input
          id="email"
          type="email"
          placeholder="seu@email.com"
          required
          style={{
            width: '100%',
            padding: '13px 11px',
            borderRadius: 8,
            border: '1.5px solid #d1d5db',
            fontSize: '1rem',
            marginBottom: 18,
            transition: 'border 0.2s',
            outline: 'none',
            background: '#f8fafc'
          }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <label htmlFor="senha" style={{
          display: 'block',
          textAlign: 'left',
          fontWeight: 600,
          marginBottom: 8,
          color: '#22223b',
          fontSize: '1.03rem'
        }}>Senha</label>
        <input
          id="senha"
          type="password"
          placeholder="Digite sua senha"
          required
          style={{
            width: '100%',
            padding: '13px 11px',
            borderRadius: 8,
            border: '1.5px solid #d1d5db',
            fontSize: '1rem',
            marginBottom: 18,
            transition: 'border 0.2s',
            outline: 'none',
            background: '#f8fafc'
          }}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          style={{
            width: '100%',
            background: '#22223b',
            color: '#fff',
            padding: '14px 0',
            border: 'none',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: '1.15rem',
            marginTop: 10,
            cursor: loading ? 'not-allowed' : 'pointer',
            letterSpacing: '0.02em'
          }}
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      {mensagem && (
        <div style={{
          marginTop: 18,
          color: mensagem?.includes('sucesso') ? 'green' : '#b91c1c',
          fontWeight: 500,
          textAlign: 'center'
        }}>
          {mensagem}
        </div>
      )}
      <div className="login-footer" style={{
        marginTop: 25,
        color: '#8d99ae',
        fontSize: '0.96rem',
        lineHeight: 1.3
      }}>
        Acesso restrito aos integrantes do Grupo A&eight e parceiros autorizados.
      </div>
    </div>
  );
};

export default LoginForm;
