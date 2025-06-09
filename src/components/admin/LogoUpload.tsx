
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Upload } from 'lucide-react';

export const LogoUpload: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, variant: 'light' | 'dark') => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você deve selecionar uma imagem para upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `aeight-logo-${variant}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      toast({
        title: 'Logo enviado com sucesso!',
        description: `Logo ${variant} da A&eight foi atualizado.`,
      });

      // Recarregar a página para mostrar o novo logo
      window.location.reload();
    } catch (error: any) {
      toast({
        title: 'Erro no upload',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload do Logo A&eight
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="logo-light">Logo Claro (fundo escuro)</Label>
            <Input
              id="logo-light"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'light')}
              disabled={uploading}
            />
          </div>
          <div>
            <Label htmlFor="logo-dark">Logo Escuro (fundo claro)</Label>
            <Input
              id="logo-dark"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'dark')}
              disabled={uploading}
            />
          </div>
        </div>
        {uploading && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Enviando logo...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
