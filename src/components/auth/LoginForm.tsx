
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  console.log('LoginForm renderizado - authError:', authError);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleLogin chamado com:', { email, senha: '***' });
    
    if (!email || !senha) {
      toast({
        title: "Erro",
        description: "Por favor, preencha email e senha",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Tentando fazer login...');
      const success = await login(email, senha);
      console.log('Resultado do login:', success);

      if (success) {
        toast({
          title: "Login bem-sucedido",
          description: "Redirecionando...",
          variant: "default",
        });
        console.log('Login bem-sucedido, redirecionando...');
        navigate("/");
      } else {
        console.log('Login falhou');
        toast({
          title: "Erro no login",
          description: authError || "Falha na autenticação",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro durante login:", error);
      toast({
        title: "Erro",
        description: "Erro interno durante o login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          required
          className="mb-4"
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
        <Input
          id="senha"
          type="password"
          placeholder="Digite sua senha"
          required
          className="mb-4"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          disabled={loading}
        />
        
        <Button
          type="submit"
          className="w-full mt-4 text-lg font-bold"
          variant="default"
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
      
      {authError && (
        <div className="mt-4 text-red-600 font-medium text-center">
          {authError}
        </div>
      )}
      
      <div className="mt-6 text-sm text-slate-500">
        Acesso restrito aos integrantes do Grupo A&eight e parceiros autorizados.
      </div>
      
      <footer style={{ marginTop: 32, fontSize: 12, color: '#888' }}>
        Desenvolvido por Thiago Rotondo
      </footer>
    </div>
  );
};

export default LoginForm;
