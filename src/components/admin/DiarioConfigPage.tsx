import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type TipoAtividade = {
  id: string;
  nome: string;
};

type Categoria = {
  id: string;
  nome: string;
};

type Aba = "tipos" | "categorias";

const DiarioConfigPage: React.FC = () => {
  const [aba, setAba] = useState<Aba>("tipos");

  // Tipos de atividade
  const [tipos, setTipos] = useState<TipoAtividade[]>([]);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [novoTipo, setNovoTipo] = useState("");
  const [editTipoId, setEditTipoId] = useState<string | null>(null);
  const [editTipoNome, setEditTipoNome] = useState("");
  const [feedbackTipos, setFeedbackTipos] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Categorias
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [editCategoriaId, setEditCategoriaId] = useState<string | null>(null);
  const [editCategoriaNome, setEditCategoriaNome] = useState("");
  const [feedbackCategorias, setFeedbackCategorias] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // --- Tipos de Atividade ---
  const fetchTipos = async () => {
    setLoadingTipos(true);
    const { data, error } = await supabase.from("diario_tipos_atividade").select("*").order("nome");
    setTipos(data || []);
    setLoadingTipos(false);
    if (error) setFeedbackTipos({ type: "error", msg: "Erro ao carregar tipos." });
  };

  useEffect(() => {
    if (aba === "tipos") fetchTipos();
  }, [aba]);

  const handleAddTipo = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackTipos(null);
    if (!novoTipo) return;
    const { error } = await supabase.from("diario_tipos_atividade").insert({ nome: novoTipo });
    if (error) setFeedbackTipos({ type: "error", msg: "Erro ao adicionar tipo." });
    else {
      setFeedbackTipos({ type: "success", msg: "Tipo adicionado!" });
      setNovoTipo("");
      fetchTipos();
    }
  };

  const startEditTipo = (tipo: TipoAtividade) => {
    setEditTipoId(tipo.id);
    setEditTipoNome(tipo.nome);
    setFeedbackTipos(null);
  };

  const handleEditTipoSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTipoId) return;
    const { error } = await supabase
      .from("diario_tipos_atividade")
      .update({ nome: editTipoNome })
      .eq("id", editTipoId);
    if (error) setFeedbackTipos({ type: "error", msg: "Erro ao salvar edição." });
    else {
      setFeedbackTipos({ type: "success", msg: "Tipo atualizado!" });
      setEditTipoId(null);
      setEditTipoNome("");
      fetchTipos();
    }
  };

  const cancelEditTipo = () => {
    setEditTipoId(null);
    setEditTipoNome("");
  };

  const handleRemoveTipo = async (id: string) => {
    setFeedbackTipos(null);
    const confirmed = window.confirm("Tem certeza que deseja remover este tipo?");
    if (!confirmed) return;
    const { error } = await supabase.from("diario_tipos_atividade").delete().eq("id", id);
    if (error) setFeedbackTipos({ type: "error", msg: "Erro ao remover tipo." });
    else {
      setFeedbackTipos({ type: "success", msg: "Tipo removido!" });
      fetchTipos();
    }
  };

  // --- Categorias ---
  const fetchCategorias = async () => {
    setLoadingCategorias(true);
    const { data, error } = await supabase.from("diario_categorias").select("*").order("nome");
    setCategorias(data || []);
    setLoadingCategorias(false);
    if (error) setFeedbackCategorias({ type: "error", msg: "Erro ao carregar categorias." });
  };

  useEffect(() => {
    if (aba === "categorias") fetchCategorias();
  }, [aba]);

  const handleAddCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackCategorias(null);
    if (!novaCategoria) return;
    const { error } = await supabase.from("diario_categorias").insert({ nome: novaCategoria });
    if (error) setFeedbackCategorias({ type: "error", msg: "Erro ao adicionar categoria." });
    else {
      setFeedbackCategorias({ type: "success", msg: "Categoria adicionada!" });
      setNovaCategoria("");
      fetchCategorias();
    }
  };

  const startEditCategoria = (cat: Categoria) => {
    setEditCategoriaId(cat.id);
    setEditCategoriaNome(cat.nome);
    setFeedbackCategorias(null);
  };

  const handleEditCategoriaSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCategoriaId) return;
    const { error } = await supabase
      .from("diario_categorias")
      .update({ nome: editCategoriaNome })
      .eq("id", editCategoriaId);
    if (error) setFeedbackCategorias({ type: "error", msg: "Erro ao salvar edição." });
    else {
      setFeedbackCategorias({ type: "success", msg: "Categoria atualizada!" });
      setEditCategoriaId(null);
      setEditCategoriaNome("");
      fetchCategorias();
    }
  };

  const cancelEditCategoria = () => {
    setEditCategoriaId(null);
    setEditCategoriaNome("");
  };

  const handleRemoveCategoria = async (id: string) => {
    setFeedbackCategorias(null);
    const confirmed = window.confirm("Tem certeza que deseja remover esta categoria?");
    if (!confirmed) return;
    const { error } = await supabase.from("diario_categorias").delete().eq("id", id);
    if (error) setFeedbackCategorias({ type: "error", msg: "Erro ao remover categoria." });
    else {
      setFeedbackCategorias({ type: "success", msg: "Categoria removida!" });
      fetchCategorias();
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Configurações do Diário</h1>

      <div className="mb-6 flex gap-2 border-b">
        <button
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            aba === "tipos"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-primary"
          }`}
          onClick={() => setAba("tipos")}
        >
          Tipos de Atividade
        </button>
        <button
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            aba === "categorias"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-primary"
          }`}
          onClick={() => setAba("categorias")}
        >
          Categorias
        </button>
      </div>

      {/* Tipos de Atividade */}
      {aba === "tipos" && (
        <section>
          <h2 className="text-lg font-semibold mb-2">Tipos de Atividade</h2>
          {feedbackTipos && (
            <div
              className={`mb-4 px-4 py-2 rounded ${
                feedbackTipos.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {feedbackTipos.msg}
            </div>
          )}
          <form onSubmit={handleAddTipo} className="flex flex-col md:flex-row gap-2 mb-6">
            <input
              type="text"
              placeholder="Novo tipo de atividade"
              value={novoTipo}
              onChange={e => setNovoTipo(e.target.value)}
              className="input input-bordered flex-1"
              required
              disabled={loadingTipos}
            />
            <button type="submit" className="btn btn-primary" disabled={loadingTipos}>
              Adicionar
            </button>
          </form>
          {loadingTipos ? (
            <div className="text-muted-foreground">Carregando tipos...</div>
          ) : (
            <ul className="divide-y border rounded bg-card">
              {tipos.length === 0 && (
                <li className="p-4 text-muted-foreground text-center">
                  Nenhum tipo de atividade cadastrado.
                </li>
              )}
              {tipos.map((tipo) =>
                editTipoId === tipo.id ? (
                  <li key={tipo.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-accent/50">
                    <form onSubmit={handleEditTipoSave} className="flex flex-col md:flex-row gap-2 flex-1">
                      <input
                        type="text"
                        value={editTipoNome}
                        onChange={e => setEditTipoNome(e.target.value)}
                        className="input input-bordered flex-1"
                        required
                      />
                      <button type="submit" className="btn btn-primary">
                        Salvar
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={cancelEditTipo}>
                        Cancelar
                      </button>
                    </form>
                  </li>
                ) : (
                  <li key={tipo.id} className="flex items-center justify-between p-4">
                    <div>{tipo.nome}</div>
                    <div className="flex gap-2">
                      <button className="btn btn-sm btn-accent" onClick={() => startEditTipo(tipo)}>
                        Editar
                      </button>
                      <button className="btn btn-sm btn-destructive" onClick={() => handleRemoveTipo(tipo.id)}>
                        Remover
                      </button>
                    </div>
                  </li>
                )
              )}
            </ul>
          )}
        </section>
      )}

      {/* Categorias */}
      {aba === "categorias" && (
        <section>
          <h2 className="text-lg font-semibold mb-2">Categorias</h2>
          {feedbackCategorias && (
            <div
              className={`mb-4 px-4 py-2 rounded ${
                feedbackCategorias.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {feedbackCategorias.msg}
            </div>
          )}
          <form onSubmit={handleAddCategoria} className="flex flex-col md:flex-row gap-2 mb-6">
            <input
              type="text"
              placeholder="Nova categoria"
              value={novaCategoria}
              onChange={e => setNovaCategoria(e.target.value)}
              className="input input-bordered flex-1"
              required
              disabled={loadingCategorias}
            />
            <button type="submit" className="btn btn-primary" disabled={loadingCategorias}>
              Adicionar
            </button>
          </form>
          {loadingCategorias ? (
            <div className="text-muted-foreground">Carregando categorias...</div>
          ) : (
            <ul className="divide-y border rounded bg-card">
              {categorias.length === 0 && (
                <li className="p-4 text-muted-foreground text-center">
                  Nenhuma categoria cadastrada.
                </li>
              )}
              {categorias.map((cat) =>
                editCategoriaId === cat.id ? (
                  <li key={cat.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-accent/50">
                    <form onSubmit={handleEditCategoriaSave} className="flex flex-col md:flex-row gap-2 flex-1">
                      <input
                        type="text"
                        value={editCategoriaNome}
                        onChange={e => setEditCategoriaNome(e.target.value)}
                        className="input input-bordered flex-1"
                        required
                      />
                      <button type="submit" className="btn btn-primary">
                        Salvar
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={cancelEditCategoria}>
                        Cancelar
                      </button>
                    </form>
                  </li>
                ) : (
                  <li key={cat.id} className="flex items-center justify-between p-4">
                    <div>{cat.nome}</div>
                    <div className="flex gap-2">
                      <button className="btn btn-sm btn-accent" onClick={() => startEditCategoria(cat)}>
                        Editar
                      </button>
                      <button className="btn btn-sm btn-destructive" onClick={() => handleRemoveCategoria(cat.id)}>
                        Remover
                      </button>
                    </div>
                  </li>
                )
              )}
            </ul>
          )}
        </section>
      )}
    </div>
  );
};

export default DiarioConfigPage;