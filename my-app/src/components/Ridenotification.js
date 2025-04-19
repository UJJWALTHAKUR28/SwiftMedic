import React from 'react'

const Ridenotification = (props) => {
  console.log(props.ride)
  return (
    <div>
        <h5 onClick={()=>{props.setridenotifypopup(false)}} className='p-3 text-center w-full  absolute top-0'> <i className='text-3xl  text-gray-200 ri-arrow-down-wide-line'></i></h5> 
     <h3 className='font-bold text-2xl mb-5'>New Ride Availble!</h3>
    <div className='flex items-center justify-between p-3 border-red-400 mt-4 rounded-lg border-3'>
     <div className='flex items-center gap-3 '>
        <img className='h-14 w-14 rounded-full object-cover' src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbtwjeGSuGJ79h3tCl3qJaQwiH2l9b5rq6qw&s"/>
        <h2 className='text-sm font-medium'> {props.ride?.user.fullname.firstname + " " + props.ride?.user.fullname.lastname}</h2>
     </div>
     <h5 className='text-lg font-semibold'> 2.2 Km</h5>
     </div>
     <div className='flex 
     flex-col 
     justify-between items-center gap-2  md:justify-center'>
      <div className='w-full mt-5 '>
        <div className='flex items-center gap-5 p-3 border-b-2 border-gray-300'>
        <i className="text-lg ri-map-pin-fill"></i>
        <div>
          <h3 className='text-lg fonr-medium'>562/11 -A</h3>
          <p className='text-base text=gray-600'> {props.ride?.pickup}</p>
        </div>
        </div>
        <div className='flex items-center gap-5 p-3 border-b-2 border-gray-300'>
        <i className="text-lg ri-map-pin-user-fill"></i>
        <div>
          <h3 className='text-lg fonr-medium'>562/11 -A</h3>
          <p className='text-base text=gray-600'> {props.ride?.destination}</p>
        </div>
        </div>
        <div className='flex items-center gap-5 p-3 border-b-2 border-gray-300'>
        <i className="text-lg ri-currency-line"></i>
        <div>
          <h3 className='text-lg fonr-medium'>₹{props.ride?.fare}</h3>
          <p className='text-base text=gray-600'> Cash Cash</p>
        </div>

        </div>

      </div>
      <div className='flex w-full items-center justify-between gap-10'>
      <button onClick={()=>{
        props.setridenotifypopup(false),props.setConfirmridenotify(true)
      }} className='w-3/5 bg-green-500 text-white font-semibold py-2 rounded-lg mt-3 px-10 p-3 '>
        Accept
        </button>
        <button onClick={()=>{props.setridenotifypopup(false)}} className='w-3/5 bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg mt-3 px-8 p-3 '>
        Ignore
        </button>
      </div>

     </div></div>
  )
}

export default Ridenotification