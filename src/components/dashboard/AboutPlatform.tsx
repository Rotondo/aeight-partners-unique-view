
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain } from 'lucide-react';

export const AboutPlatform: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Brain className="h-5 w-5" />
        Sobre o A&eight Partnership Hub
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="prose max-w-none dark:prose-invert">
        <p>
          Bem-vindo à Plataforma Unificada de Parcerias A&eight, um sistema completo para gerenciar todas as relações com parceiros do seu negócio.
        </p>
        <p className="text-sm text-muted-foreground">
          Esta plataforma centraliza a gestão de parceiros, oportunidades de negócio intra e extragrupo, análise estratégica e arquivos visuais em um único lugar.
          Navegue pelo menu lateral para acessar as diferentes funcionalidades.
        </p>
      </div>
    </CardContent>
  </Card>
);
