import { useEffect, useState } from "react";
import type { AnimatedCounterProps } from "../../interfaces/interfacesComponents";



export function AnimatedCounter({ value, duration = 1500 }: AnimatedCounterProps) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number | null = null;
        let animationFrameId: number;
        const startValue = 0; // Sempre começa do 0 (ou você pode passar uma prop startValue)

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            
            // Garante que não passa de 1 (100%)
            const percentage = Math.min(progress / duration, 1);
            
            // Função de Easing "EaseOutExpo" (começa rápido, termina devagar)
            const easeOut = 1 - Math.pow(2, -10 * percentage);
            
            const currentCount = startValue + (value - startValue) * easeOut;

            setCount(currentCount);

            if (progress < duration) {
                animationFrameId = window.requestAnimationFrame(animate);
            } else {
                setCount(value); // Garante o valor exato no final
            }
        };

        // Inicia a animação
        animationFrameId = window.requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrameId);
    }, [value, duration]);

    // Formatação BRL (R$ 1.234,56)
    // O 'minimumFractionDigits: 2' garante os centavos (100,00)
    return (
        <span>
            {count.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
    );
}