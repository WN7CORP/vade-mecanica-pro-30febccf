
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts";

// Dados mock de tópicos mais curtidos/comentados
const MOCK_RANKING = [
  {
    categoria: "Constitucional",
    curtidas: 33,
    comentarios: 28,
  },
  {
    categoria: "Civil",
    curtidas: 28,
    comentarios: 31,
  },
  {
    categoria: "Penal",
    curtidas: 20,
    comentarios: 18,
  },
  {
    categoria: "Trabalhista",
    curtidas: 16,
    comentarios: 19,
  },
  {
    categoria: "Tributário",
    curtidas: 13,
    comentarios: 8,
  }
];

const CommunityRanking = () => (
  <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-4 mb-2 w-full">
    <h2 className="text-lg font-bold text-primary-300 mb-4">Ranking de Assuntos Mais Relevantes</h2>
    <ResponsiveContainer width="100%" height={250}>
      <BarChart
        data={MOCK_RANKING}
        layout="vertical"
        margin={{ top: 10, right: 16, left: 6, bottom: 10 }}
      >
        <XAxis type="number" />
        <YAxis dataKey="categoria" type="category" width={110} />
        <Tooltip />
        <Bar dataKey="comentarios" fill="#B794F4" barSize={12} radius={[0, 6, 6, 0]}>
          <LabelList dataKey="comentarios" position="right" />
        </Bar>
        <Bar dataKey="curtidas" fill="#9B87F5" barSize={12} radius={[0, 6, 6, 0]}>
          <LabelList dataKey="curtidas" position="right" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
    <div className="text-xs text-gray-400 mt-2">
      <span className="inline-block mr-4"><span className="inline-block w-3 h-3 rounded bg-[#B794F4] mr-1"></span>Comentários</span>
      <span className="inline-block"><span className="inline-block w-3 h-3 rounded bg-[#9B87F5] mr-1"></span>Curtidas</span>
    </div>
  </div>
);

export default CommunityRanking;
