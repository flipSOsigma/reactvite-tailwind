import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import OrderCard from '../components/OrderCard'
import { getOrderData } from '../lib/server'
import { useLocation } from 'react-router-dom'

const Dashboard = () => {

  const [orderData, setOrderData] = useState([])

  useEffect(() => {
    getOrderData().then(data => setOrderData(data.data))
  }, [])

  const path = (useLocation().pathname === '/' ? 'Dashboard' : useLocation().pathname).toLowerCase()

  return (
    <div>
      <Navbar />
      <div className="flex flex-col w-full xl:px-80 lg:px-40 md:px-20 sm:px-10 px-4">
        <div className='py-10'>   
          <p className="mb-4">{path}</p>
          <h1 className='text-2xl font-bold'>Hello Marketing</h1>
          <p className='text-gray-600'>Selamat datang di halaman dashboard</p>
          <input placeholder='silahkan cari event, pesanan, atau nama pemesan' type="text" className='border border-neutral-200 mt-4 rounded-md py-2 px-4 text-sm w-full'/>
        </div>  
      </div>
      <div className="min-h-screen bg-neutral-100 py-4">
        <div className="grid grid-cols-2 gap-4 xl:px-80 lg:px-40 md:px-20 sm:px-10 px-4">
          {orderData.map((item: any, index: number) => <OrderCard key={index} {...item} />)}
        </div>
      </div>
    </div>
  )
}

export default Dashboard