import { Card, ProgressCircle, Text } from '@tremor/react';

// Dados fictícios simulando o que virá do Backend
const topCategories = [
  { name: 'Alimentação', value: 75, color: 'rose', amount: 'R$ 850' },
  { name: 'Transporte', value: 45, color: 'amber', amount: 'R$ 320' },
  { name: 'Moradia', value: 90, color: 'indigo', amount: 'R$ 1.500' },
];

export function TopSpendingCircles() {
  return (
    <Card className="max-w-3xl mx-auto mt-6">
      <Text className="text-lg font-semibold text-gray-700 mb-6">Top 3 Categorias (Mês)</Text>
      
      <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
        {topCategories.map((cat) => (
          <div key={cat.name} className="flex flex-col items-center justify-center">
            <ProgressCircle 
              value={cat.value} 
              size="lg" // Tamanho do círculo (sm, md, lg, xl)
              color={cat.color as any} 
              strokeWidth={8} // Grossura da linha
            >
              <span className="text-sm font-medium text-gray-700">
                {cat.value}%
              </span>
            </ProgressCircle>
            
            <div className="text-center mt-3">
              <p className="text-sm font-medium text-gray-800">{cat.name}</p>
              <p className="text-xs text-gray-500">{cat.amount}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}