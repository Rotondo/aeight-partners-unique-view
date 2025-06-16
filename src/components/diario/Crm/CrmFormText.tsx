import React, { useState } from "react";

export const CrmFormText: React.FC = () => {
  const [text, setText] = useState("");
  // TODO: Integrar com contexto/actions

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setText("");
      }}
      className="flex items-center gap-2"
    >
      <input
        type="text"
        placeholder="Nota ou ação"
        className="border px-2 py-1 rounded"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button className="px-3 py-1 bg-primary text-white rounded" type="submit">
        Salvar
      </button>
    </form>
  );
};