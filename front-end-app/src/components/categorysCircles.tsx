import type { CategorysCirclesProps } from '../interfaces/interfacesComponents';
import { ProgressCircle } from './ui/progressCircle'; 


function CategorysCircles(props: CategorysCirclesProps) {
  const { data } = props;

  const colorPalette = ['rose', 'emerald', 'violet', 'amber', 'cyan', 'fuchsia'];

  const getColorVariant = (name: string) => {
    if (name.toLowerCase() === 'outros') return 'default'; 
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colorPalette.length; 
    return colorPalette[index];
  }



  const formattedData = data.map((item: any) => {
    return {
      name: item.name,
      amount: Number(item.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      value: item.percentage, 
      variant: getColorVariant(item.name) || 'default'
    };
  });




  return (
    
    <div className='flex w-full items-center justify-center'>
      <div className="grid grid-cols-4 gap-2">
        {formattedData.map((cat) => (
          <div key={cat.name} className="flex flex-col items-center">
            
            <ProgressCircle 
              value={cat.value} 
              radius={30} 
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
            
            <div className="text-center mt-2 w-17">
              <p 
                className="text-xs font-normal text-white leading-tight line-clamp-2"
                title={cat.name} 
              >
                {cat.name}
              </p>
              <p 
                className="text-xs font-normal text-white/60 truncate mt-0.5"
                title={cat.amount}
              >
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