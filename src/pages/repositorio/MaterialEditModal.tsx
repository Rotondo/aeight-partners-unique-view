// src/pages/repositorio/MaterialEditModal.tsx

import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Select, DatePicker, Tag, message, Popconfirm } from 'antd';
import { Categoria, Empresa, RepositorioMaterial, RepositorioTag } from '@/types';
import { supabase } from '@/lib/supabase';

interface MaterialEditModalProps {
  open: boolean;
  onClose: () => void;
  material: RepositorioMaterial | null;
  categorias: Categoria[];
  parceiros: Empresa[];
  tags: RepositorioTag[];
  onSave: () => void;
}

const MaterialEditModal: React.FC<MaterialEditModalProps> = ({
  open,
  onClose,
  material,
  categorias,
  parceiros,
  tags,
  onSave,
}) => {
  const [nome, setNome] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [parceiroId, setParceiroId] = useState('');
  const [validade, setValidade] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [link, setLink] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Preenche os campos ao abrir
  useEffect(() => {
    if (material) {
      setNome(material.nome || '');
      setCategoriaId(material.categoria_id || '');
      setParceiroId(material.empresa_id || '');
      setValidade(material.validade_contrato || '');
      setSelectedTags(material.tag_categoria ? (Array.isArray(material.tag_categoria) ? material.tag_categoria : [material.tag_categoria]) : []);
      setLink(material.tipo_arquivo === 'link' ? material.url_arquivo || '' : '');
    }
  }, [material]);

  const handleSave = async () => {
    if (!material) return;
    setIsSaving(true);

    try {
      // Atualiza o registro no banco
      const { error } = await supabase
        .from('repositorio_materiais')
        .update({
          nome: nome.trim(),
          categoria_id: categoriaId,
          empresa_id: parceiroId,
          validade_contrato: validade || null,
          tag_categoria: selectedTags,
          url_arquivo: material.tipo_arquivo === 'link' ? link.trim() : material.url_arquivo,
        })
        .eq('id', material.id);

      if (error) throw error;

      message.success('Material atualizado com sucesso!');
      onSave();
      onClose();
    } catch (err: any) {
      message.error('Erro ao salvar material: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!material) return;
    setIsDeleting(true);

    try {
      // Se houver arquivo, exclui do storage
      if (material.tipo_arquivo !== 'link' && material.url_arquivo) {
        const { error: storageError } = await supabase.storage
          .from('materiais')
          .remove([material.url_arquivo]);
        if (storageError) throw storageError;
      }

      // Exclui do banco
      const { error } = await supabase
        .from('repositorio_materiais')
        .delete()
        .eq('id', material.id);

      if (error) throw error;

      message.success('Material excluído com sucesso!');
      onSave();
      onClose();
    } catch (err: any) {
      message.error('Erro ao excluir material: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      visible={open}
      title="Editar Material"
      onCancel={onClose}
      onOk={handleSave}
      okText="Salvar"
      confirmLoading={isSaving}
      footer={[
        <Popconfirm
          key="delete"
          title="Tem certeza que deseja excluir este material?"
          onConfirm={handleDelete}
          okText="Excluir"
          cancelText="Cancelar"
          disabled={isDeleting}
        >
          <Button danger loading={isDeleting}>
            Excluir
          </Button>
        </Popconfirm>,
        <Button key="cancel" onClick={onClose} disabled={isSaving || isDeleting}>
          Cancelar
        </Button>,
        <Button key="save" type="primary" onClick={handleSave} loading={isSaving} disabled={isDeleting}>
          Salvar
        </Button>,
      ]}
    >
      <label>Nome do Material</label>
      <Input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={100} />

      <label style={{ marginTop: 12 }}>Categoria</label>
      <Select
        value={categoriaId}
        onChange={setCategoriaId}
        style={{ width: '100%' }}
      >
        {categorias.map((cat) => (
          <Select.Option key={cat.id} value={cat.id}>
            {cat.nome}
          </Select.Option>
        ))}
      </Select>

      <label style={{ marginTop: 12 }}>Parceiro</label>
      <Select
        value={parceiroId}
        onChange={setParceiroId}
        style={{ width: '100%' }}
      >
        {parceiros.map((parc) => (
          <Select.Option key={parc.id} value={parc.id}>
            {parc.nome}
          </Select.Option>
        ))}
      </Select>

      <label style={{ marginTop: 12 }}>Tags</label>
      <Select
        mode="multiple"
        value={selectedTags}
        onChange={setSelectedTags}
        style={{ width: '100%' }}
        maxTagCount={4}
        placeholder="Selecione tags"
      >
        {tags.map((tag) => (
          <Select.Option key={tag.id} value={tag.id}>
            {tag.nome}
          </Select.Option>
        ))}
      </Select>

      <label style={{ marginTop: 12 }}>Validade do Contrato</label>
      <DatePicker
        value={validade ? validade : undefined}
        onChange={(_, dateString) => setValidade(dateString)}
        style={{ width: '100%' }}
        format="YYYY-MM-DD"
        allowClear
      />

      {material?.tipo_arquivo === 'link' && (
        <>
          <label style={{ marginTop: 12 }}>Link</label>
          <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." />
        </>
      )}
    </Modal>
  );
};

export default MaterialEditModal;
