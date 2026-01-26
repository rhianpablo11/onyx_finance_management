import { useEffect, useRef, useState } from "react"
import type { SelectionOptionProps, SelectionProps } from "../../interfaces/interfacesComponents"


function SelectionComp(props: SelectionProps){
    const {options, placeholder, onChange, initialValue} = props
    const [isOpen, setIsOpen] = useState(false)
    const [selectedOption, setSelectedOption] = useState<SelectionOptionProps | null>(
        options.find(opt => opt.value === initialValue) || null
    )

    const handleSelect = (option: SelectionOptionProps) => {
        setSelectedOption(option)
        setIsOpen(false)
        onChange(option.value)
    }

    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return(
        <>
            <div className="relative " ref={wrapperRef}>
                <button type="button"
                        className={`
                                    flex items-center justify-between w-full h-10 px-2.5 
                                    border border-white/25 rounded-2xl 
                                    text-base font-normal focus:outline-none transition-all duration-200
                                    ${isOpen ? 'ring-1 ring-purple-500' : ''}
                                `}
                        onClick={()=>setIsOpen(!isOpen)} >
                    <span className={`${selectedOption ? "text-white" : "text-white/50"}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth={1.5} 
                        stroke="currentColor" 
                        className={`size-5 text-white/50 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                </button>
            
            {isOpen && (
                <div className="absolute right-2.5 z-50 mt-3.5 backdrop-blur-3xl w-48 bg-black/70 rounded-2xl border border-white/50  overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <ul className="max-h-64 overflow-y-auto py-1 backdrop-blur-3xl">
                        {options.map((option, index) => (
                            <li key={index}>
                                <button
                                    type="button"
                                    onClick={() => handleSelect(option)}
                                    className={`
                                        w-full text-left px-4 py-2.5 text-sm transition-colors
                                        ${selectedOption?.value === option.value 
                                            ? " text-white font-medium" 
                                            : "text-white/80 hover:bg-white/5 hover:text-white"}
                                    `}
                                >
                                    {option.label}
                                </button>
                                {index < options.length - 1 && (
                                     <div className="mx-3 h-px bg-white/50"></div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
        </>
    )
}

export default SelectionComp