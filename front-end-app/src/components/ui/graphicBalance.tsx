import { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import type { GraphicBalanceProps } from '../../interfaces/interfacesComponents';

// Dados simulados (Depois vamos puxar do seu FastAPI!)


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#18181b]/40 backdrop-blur-md border border-gray-800 p-3 rounded-xl shadow-2xl">
        <p className="text-gray-300 font-semibold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }}></div>
            <p className="text-sm text-gray-200">
              {entry.name}: <span className="font-bold tabular-nums">R$ {entry.value}</span>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

function GraphicBalance(props: GraphicBalanceProps) {
  const {monthlyData} = props;
  const [activeLegend, setActiveLegend] = useState<string | null>(null);

  // Função que roda ao clicar na legenda
  const handleLegendClick = (dataKey: string) => {
    if (activeLegend === dataKey) {
      // Se clicar no que já tá destacado, ele desmarca e volta tudo ao normal
      setActiveLegend(null);
    } else {
      // Destaca apenas o que foi clicado
      setActiveLegend(dataKey);
    }
  };

  // Função para calcular a opacidade: 1 (100%) ou 0.2 (20% transparente)
  const getOpacity = (dataKey: string) => {
    if (!activeLegend) return 1; // Se nada estiver clicado, mostra tudo normal
    return activeLegend === dataKey ? 1 : 0.2; // Foca no clicado, apaga o resto
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="h-60 w-full rounded-xl shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={monthlyData}
            // Aumentei o margin top para dar espaço pra legenda lá em cima
            margin={{ top: 0, right: 10, left: -10, bottom: 0 }}
            barGap={4} 
          >
            <CartesianGrid  vertical={false} stroke="#3f3f46" opacity={0.5} />
            
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#a1a1aa', fontSize: 12 }} 
              dy={2} 
            />
            
            <YAxis 
              axisLine={false} 
              tickLine={true} 
              tick={{ fill: '#a1a1aa', fontSize: 12 }} 
              tickFormatter={(value) => `R$${value}`} 
              tickCount={8}
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#231b29', opacity: 0.25 }} />
            
            
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle" 
              iconSize={10} // Tamanho da bolinha da legenda
              wrapperStyle={{ 
                paddingBottom: '10px', // Empurra o gráfico um pouco pra baixo
                fontSize: '14px',      // Tamanho do texto da legenda
                cursor: 'pointer',     // Deixa com a mãozinha de clique
                userSelect: 'none'     // Evita do texto ficar azul selecionado ao clicar rápido
              }} 
              onClick={(e) => handleLegendClick(e.dataKey as string)}
            />
            
            {/* AS BARRAS (Agora com a opacidade dinâmica) */}
            <Bar 
              dataKey="Entradas" 
              fill="#A78BFA" 
              fillOpacity={getOpacity("Entradas")}
              radius={[4, 4, 0, 0]} 
              maxBarSize={40} 
            />
            <Bar 
              dataKey="Saídas" 
              fill="#e7befa" 
              fillOpacity={getOpacity("Saídas")}
              radius={[4, 4, 0, 0]} 
              maxBarSize={40} 
            />
            
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default GraphicBalance;