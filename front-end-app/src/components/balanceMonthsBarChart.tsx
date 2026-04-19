import backgroundExtractPage from '../assets/Group 8.svg?url'

function BalanceMonthsBarChart(){


  return(
    <>
      <div className="rounded-[29px] w-full h-full flex-1 bg-linear-to-tl from-white/50 via-black to-white/50 p-px">
          <div className="w-full h-full px-3.5 py-2 flex flex-col  backdrop-blur-3xl  rounded-[28px] overflow-hidden bg-cover  bg-center bg-no-repeat" style={{backgroundImage: `url("${backgroundExtractPage}")`}}>
              <h1 className='text-white font-normal text-2xl'>
                  Gastos nos ult. 3 meses
              </h1>
              <div className={`mt-1 h-px w-full bg-linear-to-r from-violet-900/30 via-white/30 to-violet-900/30`}></div>
              
          </div>
      </div>

    </>
  )

}


export default BalanceMonthsBarChart