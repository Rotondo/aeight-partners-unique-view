import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const LoginForm: React.FC = () => {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMensagem('');
    const sucesso = await login(email, senha);
    if (sucesso) {
      setMensagem('Login bem-sucedido!');
    } else {
      setMensagem('E-mail ou senha incorretos.');
    }
    setIsSubmitting(false);
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 6px 32px rgba(0,0,0,0.09)',
      padding: '38px 32px 32px 32px',
      maxWidth: 400,
      margin: '0 auto'
    }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontWeight: 700, fontSize: 26 }}>A&eight Partnership Hub</h2>
        <div style={{ fontSize: 14, color: '#444', marginTop: 4 }}>
          Plataforma Unificada de Parcerias <br /><b>Destinada aos parceiros e empresas do Grupo A&eight</b>
        </div>
      </div>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Email</label>
          <input
            type="email"
            placeholder="seu.email@exemplo.com"
            style={{
              width: '100%',
              padding: '12px 10px',
              borderRadius: 7,
              border: '1.5px solid #d4d4d4',
              fontSize: 15,
              outline: 'none',
              transition: 'border 0.2s'
            }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Senha</label>
          <input
            type="password"
            placeholder="Digite sua senha"
            style={{
              width: '100%',
              padding: '12px 10px',
              borderRadius: 7,
              border: '1.5px solid #d4d4d4',
              fontSize: 15,
              outline: 'none',
              transition: 'border 0.2s'
            }}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        <button
          type="submit"
          style={{
            width: '100%',
            background: '#22223b',
            color: '#fff',
            padding: '12px',
            border: 'none',
            borderRadius: 7,
            fontWeight: 700,
            fontSize: 16,
            marginTop: 10,
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} className="animate-spin" size={18} /> : null}
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      {(mensagem || error) && (
        <div style={{
          marginTop: 18,
          color: mensagem?.includes('sucesso') ? 'green' : '#b91c1c',
          fontWeight: 500,
          textAlign: 'center'
        }}>
          {mensagem || error}
        </div>
      )}
      <div style={{ marginTop: 22, color: '#7c7c7c', fontSize: 13, textAlign: 'center' }}>
        Acesso restrito aos integrantes do Grupo A&eight e parceiros autorizados.
      </div>
    </div>
  );
};

export default LoginForm;
