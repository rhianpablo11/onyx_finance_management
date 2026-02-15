

function SkeletonLoader ({ className }: { className: string }){
    return(
        <>
            <div className={`animate-shimmer ml-2 bg-white/10 ${className}`}></div>
        </>
    )
        
}

export default SkeletonLoader