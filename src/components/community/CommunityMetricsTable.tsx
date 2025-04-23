
import React from "react";

const MOCK_METRICS = [
  { label: "Artigos Publicados", value: 28 },
  { label: "Discussões Abertas", value: 19 },
  { label: "Comentários Totais", value: 109 },
  { label: "Respostas em Thread", value: 83 },
  { label: "Usuários Ativos", value: 57 },
  { label: "Curtidas Geral", value: 146 },
  { label: "Melhores Dicas Destacadas", value: 9 },
  { label: "Badges Emitidos", value: 21 },
  { label: "Posts Moderados", value: 3 }
];

const CommunityMetricsTable = () => (
  <div className="bg-gray-900/40 rounded-lg border border-gray-800 p-4">
    <h3 className="font-semibold text-primary-300 mb-3">Métricas da Comunidade</h3>
    <table className="min-w-full text-left text-xs text-gray-200">
      <tbody>
        {MOCK_METRICS.map((m) => (
          <tr key={m.label} className="border-b border-gray-800 last:border-0">
            <td className="py-1 pr-8">{m.label}</td>
            <td className="py-1 font-bold text-primary-200">{m.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default CommunityMetricsTable;
