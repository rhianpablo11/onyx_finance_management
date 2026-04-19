import type { CategorysCirclesProps } from '../interfaces/interfacesComponents';
import { ProgressCircle } from './ui/progressCircle'; 


function CategorysCircles(props: CategorysCirclesProps) {
  const { data } = props;
  return (
    
    <div className='flex w-full items-center justify-center'>
      <div className="grid grid-cols-3 gap-4">
        {data.map((cat) => (
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