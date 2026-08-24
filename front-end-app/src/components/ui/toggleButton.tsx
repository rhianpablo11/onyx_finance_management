import type { ToggleProps } from "../../interfaces/interfacesComponents";


function ToggleButton({ isChecked, onChange }: ToggleProps) {
    return (
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={isChecked} 
                onChange={(e) => onChange(e.target.checked)} 
            />
            {/* 
                Fundo do switch: 
                - Desativado: bg-white/20 (levemente transparente/cinza)
                - Ativado: peer-checked:bg-violet-600 (a cor padrão do Onyx)
                A bolinha (after):
                - Desliza suavemente (transition-all)
            */}
            <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600 shadow-inner"></div>
        </label>
    );
}


export default ToggleButton