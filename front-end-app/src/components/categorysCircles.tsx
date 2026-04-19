import { ProgressCircle } from './ui/progressCircle'; 
import { Utensils, Car, TrendingUp } from 'lucide-react'; // Importando ícones

const topCategories = [
  { 
    name: 'Alimentação', 
    value: 50, 
    variant: 'ifood', 
    amount: 'R$ 850', 
    icon: Utensils,
    iconColor: 'text-ifood-red-500' 
  },
  { 
    name: 'Transporte', 
    value: 45, 
    variant: 'uber', 
    amount: 'R$ 320', 
    icon: Car,
    iconColor: 'text-gray-900' 
  },
  { 
    name: 'Investimento', 
    value: 90, 
    variant: 'onyx', 
    amount: 'R$ 1.500', 
    icon: TrendingUp,
    iconColor: 'text-onyx-green-500' 
  },
] as const;

function CategorysCircles() {
  return (
    
    <div className='flex w-full items-center justify-center'>
      <div className="grid grid-cols-3 gap-4">
        {topCategories.map((cat) => (
          <div key={cat.name} className="flex flex-col items-center">
            
            <ProgressCircle 
              value={cat.value} 
              radius={45} 
              strokeWidth={6}
              variant={cat.variant as any} 
              className="mb-2"
            >
              <div className="flex flex-col items-center justify-center">
                {/* <cat.icon size={18} className={cat.iconColor} /> */}
                <span className="text-sm font-medium text-white/70 ">
                  {cat.value}%
                </span>
              </div>
            </ProgressCircle>
            
            <div className="text-center">
              <p className="text-sm font-normal text-white  tracking-wider">
                {cat.name}
              </p>
              <p className="text-sm font-normal text-white/60">
                {cat.amount}
              </p>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  )
}


export default CategorysCircles