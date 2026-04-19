import { 
  ComposedChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

// 🔥 DADOS SIMULADOS (Como o seu FastAPI deve devolver)
// O segredo é o dia "15 Abr" (Hoje). Ele tem o saldo real E a previsão para as linhas se conectarem!
// 🔥 DADOS SIMULADOS (MÊS COMPLETO)
// Treinou do dia 01 ao dia 15. Prevê do dia 16 ao dia 30.
const prophetData = [
  // --- PASSADO (DADOS REAIS) ---
  { date: '01 Abr', real: 3100, prev: null, band: null },
  { date: '02 Abr', real: 2900, prev: null, band: null },
  { date: '03 Abr', real: 2950, prev: null, band: null },
  { date: '04 Abr', real: 3400, prev: null, band: null },
  { date: '05 Abr', real: 3200, prev: null, band: null },
  { date: '06 Abr', real: 3800, prev: null, band: null },
  { date: '07 Abr', real: 3600, prev: null, band: null },
  { date: '08 Abr', real: 3450, prev: null, band: null },
  { date: '09 Abr', real: 3900, prev: null, band: null },
  { date: '10 Abr', real: 4100, prev: null, band: null },
  { date: '11 Abr', real: 3800, prev: null, band: null },
  { date: '12 Abr', real: 4300, prev: null, band: null },
  { date: '13 Abr', real: 4000, prev: null, band: null },
  { date: '14 Abr', real: 4000, prev: 4000, band: [4150, 4150] },
  
  // --- PONTO DE CONEXÃO (HOJE) ---
  { date: '15 Abr', real: null, prev: 4150, band: [4150, 4150] }, 
  
  // --- FUTURO (PREVISÃO DA IA) ---
  // Repare como a banda (margem de erro) vai ficando cada vez mais larga!
  { date: '16 Abr', real: null, prev: 4000, band: [3800, 4200] },
  { date: '17 Abr', real: null, prev: 3900, band: [3600, 4200] },
  { date: '18 Abr', real: null, prev: 4100, band: [3700, 4500] },
  { date: '19 Abr', real: null, prev: 3800, band: [3300, 4300] },
  { date: '20 Abr', real: null, prev: 4200, band: [3600, 4800] },
  { date: '21 Abr', real: null, prev: 4500, band: [3800, 5200] },
  { date: '22 Abr', real: null, prev: 4300, band: [3500, 5100] },
  { date: '23 Abr', real: null, prev: 4700, band: [3800, 5600] },
  { date: '24 Abr', real: null, prev: 4600, band: [3600, 5600] },
  { date: '25 Abr', real: null, prev: 4900, band: [3800, 6000] },
  { date: '26 Abr', real: null, prev: 4800, band: [3600, 6000] },
  { date: '27 Abr', real: null, prev: 5100, band: [3800, 6400] },
  { date: '28 Abr', real: null, prev: 5300, band: [3900, 6700] },
  { date: '29 Abr', real: null, prev: 5000, band: [3500, 6500] },
  { date: '30 Abr', real: null, prev: 5400, band: [3700, 7100] },
];


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    
    // 1. Pescamos quem é a linha principal (Pode ser 'real' ou 'prev')
    const mainEntry = payload.find((p: any) => p.dataKey === 'real' || p.dataKey === 'prev');
    // 2. Pescamos quem é a banda de erro (se existir nesse dia)
    const bandEntry = payload.find((p: any) => p.dataKey === 'band');

    return (
      <div className="bg-[#18181b]/20 backdrop-blur-md border border-gray-800 p-3 rounded-xl shadow-2xl min-w-50">
        <p className="text-gray-400 font-medium text-sm border-b border-gray-700/50 pb-2 mb-3">{label}</p>
        
        {/* PARTE DE CIMA: Mostra o Saldo Real ou a Previsão */}
        {mainEntry && (
          <div className="flex items-center justify-between gap-4 ">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: mainEntry.color }}></div>
              <span className="text-sm font-medium text-gray-300">
                {mainEntry.dataKey === 'real' ? 'Saldo Atual' : 'Previsão (IA)'}
              </span>
            </div>
            <span className="font-bold text-white tabular-nums">
              R$ {mainEntry.value}
            </span>
          </div>
        )}

        {/* PARTE DE BAIXO: Mostra a Margem (Apenas se ela existir e for um array válido) */}
        {bandEntry && bandEntry.value && Array.isArray(bandEntry.value) && (
          <div className="flex flex-col mt-3 pt-3 border-t border-gray-700/50">
            <span className="text-[11px] text-violet-400 font-semibold uppercase tracking-wider mb-1.5">
              Margem de Variação
            </span>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-gray-400">Min: <span className="font-medium text-gray-200">R$ {bandEntry.value[0]}</span></span>
              <span className="text-xs text-gray-400">Máx: <span className="font-medium text-gray-200">R$ {bandEntry.value[1]}</span></span>
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

function ProphetLineChart() {
    const todayItem = [...prophetData].reverse().find(item => item.real !== null);
    const todayLabel = todayItem ? todayItem.date : undefined;

  return (
    <div className="w-full max-w-4xl ">
      

      {/* O mesmo fundo Glassmorphism que vc curtiu */}
      <div className="h-40 w-full relative overflow-hidden">
        
        {/* Um brilho roxo no fundo pra dar a vibe "Inteligência Artificial" */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-900/10  blur-3xl -z-10 pointer-events-none"></div>

        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={prophetData}
            margin={{ top: 5, right: 25, left: -10, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="#3f3f46" opacity={0.3} />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} dy={5} minTickGap={20}/>
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} tickFormatter={(value) => `R$${value}`} tickCount={14} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#52525b', strokeWidth: 1, strokeDasharray: '4 4' }} />
            
            {/* 🔥 A BANDA DE CONFIANÇA (Margem de erro do Prophet) */}
            <Area 
              type="monotone" 
              dataKey="band" 
              stroke="none" 
              fill="#A78BFA" 
              fillOpacity={0.2} 
              activeDot={false}
            />

            {/* 🔥 SALDO REAL (Passado) - Linha Sólida Verde/Azul */}
            <Line 
              type="monotone" 
              dataKey="real" 
              stroke="#2DD4BF" 
              strokeWidth={1} 
              dot={{ r: 1.5, fill: '#09090b', stroke: '#2DD4BF', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#2DD4BF', stroke: '#09090b' }}
            />

            {/* 🔥 PREVISÃO DA IA (Futuro) - Linha Tracejada Roxa */}
            <Line 
              type="monotone" 
              dataKey="prev" 
              stroke="#A78BFA" 
              strokeWidth={1.5} 
              strokeDasharray="4 4" // Faz a linha ficar tracejada!
              dot={{ r: 1, fill: '#09090b', stroke: '#A78BFA', strokeWidth: 4 }}
              activeDot={{ r: 6, fill: '#A78BFA', stroke: '#09090b' }}
            />

            {/* Linha vertical marcando o "HOJE" */}
            <ReferenceLine x={todayLabel} stroke="#52525b" strokeDasharray="8 8">
               <text x="50%" y="10%" fill="#a1a1aa" fontSize={12} textAnchor="middle">Hoje</text>
            </ReferenceLine>

          </ComposedChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

export default ProphetLineChart;