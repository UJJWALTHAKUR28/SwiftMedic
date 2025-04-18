import React from 'react'

const WaitingForDrivers = (props) => {
  return (
    <div>
       <h5 onClick={()=>{
        props.waitingForDriver(false)
       }} className='p-3 text-center w-full  absolute top-0'> <i className='text-3xl  text-gray-200 ri-arrow-down-wide-line'></i></h5> 
     <div className='flex items-center justify-between'>
     <img className='h-24' src="images/2Q.png"/>
     <div className='text-right'>
     <h2 className='text-lg font-medium'>Driver Name</h2>
      <h4 className='text-xl font-semibold -mt-1 -mb-1'> driver no 343 </h4>
      <p className='text-sm text-gray-600'> basic ambulace</p>
     </div>
      
     </div>
     <div className='flex 
     flex-col 
     justify-between items-center gap-2  md:justify-center'>
      
      <div className='w-full mt-5 '>
        <div className='flex items-center gap-5 p-3 border-b-2 border-gray-300'>
        <i className="text-lg ri-map-pin-fill"></i>
        <div>
          <h3 className='text-lg fonr-medium'>562/11 -A</h3>
          <p className='text-base text=gray-600'> JAI HO, chandigarh</p>
        </div>
        </div>
        <div className='flex items-center gap-5 p-3 border-b-2 border-gray-300'>
        <i className="text-lg ri-map-pin-user-fill"></i>
        <div>
          <h3 className='text-lg fonr-medium'>562/11 -A</h3>
          <p className='text-base text=gray-600'> JAI HO, chandigarh</p>
        </div>
        </div>
        <div className='flex items-center gap-5 p-3 border-b-2 border-gray-300'>
        <i className="text-lg ri-currency-line"></i>
        <div>
          <h3 className='text-lg fonr-medium'>RS/ 500</h3>
          <p className='text-base text=gray-600'> Cash Cash</p>
        </div>

        </div>

      </div>

     
     </div>

    </div>
  )
}

export default WaitingForDrivers