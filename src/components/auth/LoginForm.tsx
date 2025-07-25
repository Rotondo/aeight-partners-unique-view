
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
    <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center border border-gray-200">
      <div className="text-center mb-6">
        <div className="text-3xl font-bold mb-1 text-gray-800">
          A&eight Partnership Hub
        </div>
        <div className="text-gray-600 text-lg mb-5 leading-relaxed">
          Plataforma Unificada de Parcerias<br />
          <strong>Exclusivo para integrantes e parceiros do Grupo A&eight</strong>
        </div>
      </div>
      
      <form onSubmit={handleLogin} autoComplete="on" noValidate>
        <div className="mb-4">
          <label htmlFor="email" className="block text-left font-semibold mb-2 text-gray-800 text-base">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="seu@email.com"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="senha" className="block text-left font-semibold mb-2 text-gray-800 text-base">
            Senha
          </label>
          <Input
            id="senha"
            name="password"
            type="password"
            placeholder="Digite sua senha"
            required
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            disabled={loading}
            className="w-full"
          />
        </div>
        
        <Button
          type="submit"
          className="w-full mt-6 text-lg font-bold py-3"
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
      
      <footer className="mt-8 text-xs text-gray-500">
        Desenvolvido por Thiago Rotondo
      </footer>
    </div>
  );
};

export default LoginForm;
