// component for input of chat page and login/sign up
import backgroundInputChat from '../assets/bg-input-chat-ia.svg?url'


function Input(){

    // return(
    //     <>
    //         <div className="flex h-24 rounded-[28px] bg-cover bg-center bg-no-repeat" style={{backgroundImage: `url("${backgroundInputChat}")`}}>
    //             <textarea 
    //                 placeholder='Descreva aqui o seu gasto, ou recebimento, para poder ser adicionado!'
    //                 className='text-white rounded-[28px] p-3 w-full h-full backdrop-blur-2xl text-left font-extralight text-sm focus:outline-none resize-none  placeholder:text-white/50 '
    //                 >
    //             </textarea>
    //         </div>
    //     </>
    // )




    // return(
    //     <>
    //         <div className='flex h-10 rounded-[14px] bg-[#37363E] justify-center items-center w-full'>
    //             <input className='w-full h-full p-2.5 flex items-center font-normal text-base text-white placeholder:text-white/75 focus:outline-none'
    //                    type='email'
    //                    placeholder='example@example.com'
    //                    required
    //                    >
    //             </input>
    //         </div>
    //     </>
    // )




    //olho fechado
    // <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
    //     <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
    // </svg>


    // return(
    //     <>
    //         <div className='flex h-10 rounded-[14px] bg-[#37363E] justify-start pr-4 items-center w-full'>
    //             <input className='w-full h-full p-2.5 flex items-center font-normal text-base text-white placeholder:text-white/75 focus:outline-none'
    //                    type='password'
    //                    placeholder='insira sua senha'
    //                    required
    //                    minLength={8}
    //                    maxLength={64}
    //                    >
    //             </input>
    //             <button className='text-[#BDBCBF]'>
    //                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
    //                     <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    //                     <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    //                 </svg>

    //             </button>
    //         </div>
    //     </>
    // )


    // return(
    //     <>
    //         <div className='flex h-10 rounded-[14px] bg-[#37363E] justify-center items-center w-full'>
    //             <input className='w-full h-full p-2.5 flex items-center font-normal text-base text-white placeholder:text-white/75 focus:outline-none'
    //                    type='text'
    //                    placeholder='Fulano da Silva dos Santos'
    //                    required
    //                    maxLength={255}
    //                    >
    //             </input>
    //         </div>
    //     </>
    // )



    return(
        <>
            <div className='flex h-10 rounded-[14px] bg-[#37363E] justify-center items-center w-full'>
                <input className='w-full h-full p-2.5 flex items-center font-normal text-base text-white placeholder:text-white/75 focus:outline-none'
                       type='tel'
                       placeholder='(11) 98765-4321'
                       required
                       pattern="([0-9]{2}) [0-9]{5}-[0-9]{4}"
                       maxLength={20}
                       >
                </input>
            </div>
        </>
    )

}


export default Input