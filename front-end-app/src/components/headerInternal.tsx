// component for header of internal pages -> say hello or indicate page


function HeaderInternal(){


    return(
        <>
            <div className="w-full h-full flex rounded-xl pt-4 justify-between">
                    <div className="flex-col">
                        <div className="flex items-baseline">
                            <h1 className="text-white/50 pr-2 font-extralight text-[28px] leading-none">
                                Olá, 
                            </h1>
                            <h2 className="text-white font-normal text-[32px] leading-none">
                                Rhian Pablo
                            </h2>
                        </div>
                        <div>
                            <h1 className="text-white font-extralight text-xs ">
                                Tenha uma ótima tarde
                            </h1>
                        </div>
                    </div>
                    <div className="flex text-white items-center py-4">
                        <button>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                            </svg>
                        </button>
                    </div>
            </div>
        </>
    )
}

export default HeaderInternal