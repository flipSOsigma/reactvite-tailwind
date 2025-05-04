'use client';

import { useEffect, useState } from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa6';
import Navbar from '../components/Navbar';
import { MdChevronRight } from 'react-icons/md';
import { CiCirclePlus } from 'react-icons/ci';
import { HiEquals } from 'react-icons/hi2';
import { Link, useParams } from 'react-router-dom';

type Portion = {
  id: string;
  portion_name: string;
  portion_note: string;
  portion_count: number;
  portion_price: number;
  portion_total_price: number;
};

type Section = {
  id: string;
  section_name: string;
  section_note: string;
  section_price: number;
  section_portion: number;
  section_total_price: number;
  portions: Portion[];
};

type OrderData = {
  unique_id: string;
  event_name: string;
  invitation: number;
  visitor: number;
  note: string;
  price: number;
  portion: number;
  customer: {
    id: string;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
  };
  event: {
    id: string;
    event_name: string;
    event_location: string;
    event_date: string;
    event_building: string;
    event_category: string;
    event_time: string;
  };
  sections: Section[];
};

export default function UpdateOrderWedding() {
  const id = useParams().uid;
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [approve, setApprove] = useState(false);
  const [isDisabledMessage, setIsDisabledMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const apiRoute = import.meta.env.VITE_API_ROUTE;
      try {
        const response = await fetch(`${apiRoute}/order/${id}`);
        const data = await response.json();
        setOrder(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching order:', error);
          setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleSectionUpdate = (sectionId: string, updatedPortions: Portion[]) => {
    if (!order) return;

    setOrder({
      ...order,
      sections: order.sections.map(section => 
        section.id === sectionId 
          ? { 
              ...section, 
              portions: updatedPortions,
              section_portion: updatedPortions.reduce((sum, portion) => sum + portion.portion_count, 0),
              section_total_price: updatedPortions.reduce((sum, portion) => sum + portion.portion_total_price, 0)
            } 
          : section
      )
    });
  };

  const handlePortionChange = (
    sectionId: string,
    portionId: string,
    field: keyof Portion | 'section_note',
    value: string | number
  ) => {
    if (!order) return;
  
    // Handle section note update
    if (field === 'section_note') {
      setOrder({
        ...order,
        sections: order.sections.map(section => 
          section.id === sectionId 
            ? { ...section, section_note: value as string }
            : section
        )
      });
      return;
    }
  
    // Handle portion updates
    const updatedSections = order.sections.map(section => {
      if (section.id === sectionId) {
        const updatedPortions = section.portions.map(portion => {
          if (portion.id === portionId) {
            const updatedPortion = { ...portion, [field]: value };
            
            if (field === 'portion_count' || field === 'portion_price') {
              const count = field === 'portion_count' ? Number(value) : portion.portion_count;
              const price = field === 'portion_price' ? Number(value) : portion.portion_price;
              updatedPortion.portion_total_price = count * price;
            }
            
            return updatedPortion;
          }
          return portion;
        });
        
        return {
          ...section,
          portions: updatedPortions,
          section_portion: updatedPortions.reduce((sum, p) => sum + p.portion_count, 0),
          section_total_price: updatedPortions.reduce((sum, p) => sum + p.portion_total_price, 0)
        };
      }
      return section;
    });
  
    setOrder({
      ...order,
      sections: updatedSections,
      price: updatedSections.reduce((sum, section) => sum + section.section_total_price, 0),
      portion: updatedSections.reduce((sum, section) => sum + section.section_portion, 0)
    });
  };

  const addPortion = (sectionId: string) => {
    if (!order) return;

    const newPortion: Portion = {
      id: `new-${Date.now()}`,
      portion_name: '',
      portion_note: '',
      portion_count: 0,
      portion_price: 0,
      portion_total_price: 0
    };

    handleSectionUpdate(
      sectionId,
      [...order.sections.find(s => s.id === sectionId)?.portions || [], newPortion]
    );
  };

  const removePortion = (sectionId: string, portionId: string) => {
    if (!order) return;

    const section = order.sections.find(s => s.id === sectionId);
    if (!section || section.portions.length <= 1) return;

    handleSectionUpdate(
      sectionId,
      section.portions.filter(p => p.id !== portionId)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !approve) return;

    try {
      const response = await fetch(`http://localhost:3030/order/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(order)
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      const result = await response.json();
      console.log('Order updated:', result);
      // router.push('/dashboard');
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleGeneratePDF = () => {
    if (order) {
      // generateOrderPDF(order);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!order) return <div>Order not found</div>;

  const buffetSection = order.sections.find(s => s.section_name === 'Buffet');
  const menuSection = order.sections.find(s => s.section_name === 'Menu Pondokan');
  const dessertSection = order.sections.find(s => s.section_name === 'Dessert');
  const akadSection = order.sections.find(s => s.section_name === 'Akad');

  return (
    <div className='bg-slate-100 min-h-screen'>
      <Navbar />
      <div className='w-full flex border-b border-b-slate-100 flex-col lg:px-80 md:px-20 px-4 pt-2 pb-6 bg-white shadow'>
        <div className='pt-2 flex items-center gap-2'>
          <Link to="/dashboard">Dashboard</Link>
          <MdChevronRight />
          <Link to="/dashboard/wedding">Wedding</Link>
          <MdChevronRight />
          <span>Update Order</span>
        </div>
        <h1 className='font-bold mt-4 text-xl'>Update Acara Wedding</h1>
        <p>Silahkan perbarui data formulir di bawah ini</p>
        
        <div className='mt-8'>
          <p>Data Pemesan</p>
          <div className='grid grid-cols-3 mt-4 items-center gap-4'>
            <input
              type='text'
              value={order.event_name}
              onChange={(e) => setOrder({...order, event_name: e.target.value})}
              className='flex-1 border px-4 py-3 text-sm border-slate-300 rounded'
              placeholder='nama event'
            />

            <input
              type='text'
              value={order.customer.customer_name}
              onChange={(e) => setOrder({
                ...order, 
                customer: {
                  ...order.customer,
                  customer_name: e.target.value
                }
              })}
              className='flex-1 border px-4 py-3 text-sm border-slate-300 rounded'
              placeholder='nama pemesan'
            />

            <input
              type='number'
              value={order.customer.customer_phone}
              onChange={(e) => setOrder({
                ...order, 
                customer: {
                  ...order.customer,
                  customer_phone: e.target.value
                }
              })}
              className='flex-1 border px-4 py-3 text-sm border-slate-300 rounded'
              placeholder='nomor telpon'
            />

            <input
              type='text'
              value={order.customer.customer_email}
              onChange={(e) => setOrder({
                ...order, 
                customer: {
                  ...order.customer,
                  customer_email: e.target.value
                }
              })}
              className='flex-1 border px-4 py-3 text-sm border-slate-300 rounded'
              placeholder='email'
            />

            <input
              type='date'
              value={order.event.event_date.split('T')[0]}
              onChange={(e) => setOrder({
                ...order, 
                event: {
                  ...order.event,
                  event_date: e.target.value
                }
              })}
              className='flex-1 border px-4 py-3 text-sm border-slate-300 rounded'
              placeholder='hari tanggal'
            />

            <input
              type='text'
              value={order.event.event_building}
              onChange={(e) => setOrder({
                ...order, 
                event: {
                  ...order.event,
                  event_building: e.target.value
                }
              })}
              className='flex-1 border px-4 py-3 text-sm border-slate-300 rounded'
              placeholder='gedung'
            />

            <input
              type='text'
              value={order.event.event_location}
              onChange={(e) => setOrder({
                ...order, 
                event: {
                  ...order.event,
                  event_location: e.target.value
                }
              })}
              className='flex-1 border px-4 py-3 text-sm border-slate-300 rounded'
              placeholder='alamat'
            />

            <input
              type='time'
              value={order.event.event_time}
              onChange={(e) => setOrder({
                ...order, 
                event: {
                  ...order.event,
                  event_time: e.target.value
                }
              })}
              className='flex-1 border px-4 py-3 text-sm border-slate-300 rounded'
              placeholder='jam'
            />

            <input
              type='text'
              value={order.event.event_category}
              disabled
              className='flex-1 border px-4 py-3 text-sm border-slate-300 rounded'
              placeholder='acara'
            />
          </div> 
        </div>

        <div className='border-b border-b-slate-200 mt-4' />
        
        <div className='mt-8'>
          <p>Data Pesanan</p>
          <div className='flex mt-4 items-center gap-4'>
            <input
              type='number'
              value={order.invitation}
              onChange={(e) => setOrder({
                ...order,
                invitation: Number(e.target.value),
                visitor: Number(e.target.value) * 2
              })}
              className='flex-1 border px-4 py-3 text-sm border-slate-300 rounded'
              placeholder='undangan'
            />
            <MdChevronRight />
            <input
              value={order.invitation * 2}
              type='number'
              disabled
              className='flex-1 border px-4 py-3 text-sm border-slate-300 rounded'
              placeholder='estimasi orang'
            />
          </div>
          <div className='flex mt-4 items-center gap-4'>
            <div className='flex-1 px-4'></div>
            <CiCirclePlus />
            <input
              type='number'
              value={order.visitor - (order.invitation * 2)}
              onChange={(e) => setOrder({
                ...order,
                visitor: (order.invitation * 2) + (Number(e.target.value) || 0)
              })}
              className='flex-1 border px-4 py-3 text-sm border-slate-300 rounded'
              placeholder='tambahan orang'
            />
          </div>
          <div className='flex mt-4 items-center gap-4'>
            <div className='flex-1 px-4 text-end'>Total Orang</div>
            <HiEquals />
            <input
              value={order.visitor}
              disabled
              type='number'
              className='flex-1 border px-4 py-3 text-sm border-slate-300 rounded'
              placeholder='total orang'
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className='lg:px-80 md:px-20 px-4 p-6 space-y-4 bg-slate-100'>
        {buffetSection && (
          <FoodSection
            title='Buffet'
            section={buffetSection}
            onPortionChange={handlePortionChange}
            onAddPortion={addPortion}
            onRemovePortion={removePortion}
          />
        )}

        {menuSection && (
          <FoodSection
            title='Menu Pondokan'
            section={menuSection}
            onPortionChange={handlePortionChange}
            onAddPortion={addPortion}
            onRemovePortion={removePortion}
          />
        )}

        {dessertSection && (
          <FoodSection
            title='Dessert'
            section={dessertSection}
            onPortionChange={handlePortionChange}
            onAddPortion={addPortion}
            onRemovePortion={removePortion}
          />
        )}

        {akadSection && (
          <FoodSection
            title='Acara Akad'
            section={akadSection}
            onPortionChange={handlePortionChange}
            onAddPortion={addPortion}
            onRemovePortion={removePortion}
          />
        )}

        <div className='bg-white p-6 rounded-md shadow border border-slate-200'>
          <div className='text-sm text-slate-700 mb-4 flex items-center flex-wrap gap-2'>
            <strong>Estimasi total Tamu:</strong> {order.visitor} | {' '}
            <strong>Total Semua Porsi:</strong> {order.portion} | {' '}
            <strong>Total Semua Harga:</strong> {order.price.toLocaleString()}
          </div>

          <label className='block mb-1 font-medium'>Catatan Tambahan</label>
          <textarea
            rows={6}
            className='w-full border px-4 py-3 text-sm border-slate-300 rounded'
            placeholder='Catatan umum'
            value={order.note}
            onChange={(e) => setOrder({...order, note: e.target.value})}
          />

          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              checked={approve}
              onChange={() => setApprove(!approve)}
              id='accept'
            />
            <label htmlFor='accept' className="text-sm">Saya yakin dengan perubahan data di atas</label>
          </div>
          
          <div className='flex justify-end gap-2 mt-6'>
            <button
              type='button'
              onClick={handleGeneratePDF}
              className='text-xs bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 duration-300'
            >
              Generate PDF
            </button>
            <button
              type='submit'
              disabled={!approve}
              className='text-xs bg-primary disabled:bg-slate-400 text-white px-4 py-2 rounded hover:bg-yellow-600 duration-300'
            >
              Update Order
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

type FoodSectionProps = {
  title: string;
  section: Section;
  onPortionChange: (sectionId: string, portionId: string, field: keyof Portion | 'section_note', value: string | number) => void;
  onAddPortion: (sectionId: string) => void;
  onRemovePortion: (sectionId: string, portionId: string) => void;
};

function FoodSection({ title, section, onPortionChange, onAddPortion, onRemovePortion }: FoodSectionProps) {
  return (
    <div className='bg-white p-6 rounded-md shadow border border-slate-200'>
      <h1 className='font-bold text-xl'>{title}</h1>
      <p>Silahkan perbarui menu {title.toLowerCase()}</p>
      
      {section.portions.map((portion) => (
        <div className='grid grid-cols-4 mt-4 items-center gap-4' key={portion.id}>
          <input
            type='text'
            placeholder='Nama menu'
            className='border px-4 py-3 text-sm border-slate-300 rounded'
            value={portion.portion_name}
            onChange={(e) => onPortionChange(section.id, portion.id, 'portion_name', e.target.value)}
          />
          <input
            type='number'
            placeholder='Harga /porsi'
            className='border px-4 py-3 text-sm border-slate-300 rounded'
            value={portion.portion_price}
            onChange={(e) => onPortionChange(section.id, portion.id, 'portion_price', Number(e.target.value))}
          />
          <input
            type='number'
            placeholder='Jumlah porsi'
            className='border px-4 py-3 text-sm border-slate-300 rounded'
            value={portion.portion_count}
            onChange={(e) => onPortionChange(section.id, portion.id, 'portion_count', Number(e.target.value))}
          />
          <input
            disabled
            type='number'
            placeholder='Total harga'
            className='border px-4 py-3 text-sm border-slate-300 rounded'
            value={portion.portion_total_price}
          />
          
          <textarea 
            className="border px-4 py-3 text-sm border-slate-300 rounded col-span-4" 
            placeholder={`Catatan untuk ${portion.portion_name}`}
            value={portion.portion_note}
            onChange={(e) => onPortionChange(section.id, portion.id, 'portion_note', e.target.value)}
          />
        </div>
      ))}

      <textarea
        rows={4}
        className='w-full border px-4 py-3 text-sm border-slate-300 rounded mt-4'
        placeholder={`Catatan untuk ${title.toLowerCase()}`}
        value={section.section_note}
        onChange={(e) => onPortionChange(section.id, '', 'section_note', e.target.value)}
      />

      <div className='text-sm text-right mt-2 text-slate-600'>
        Total Porsi: <strong>{section.section_portion}</strong> | Total Harga:{' '}
        <strong>{section.section_total_price.toLocaleString()}</strong>
      </div>

      <div className='flex justify-end gap-2'>
        <button
          onClick={(e) => {
            e.preventDefault();
            onAddPortion(section.id);
          }}
          className='mt-4 bg-primary text-white px-4 py-2 text-xs rounded flex items-center gap-2'
        >
          <FaPlus /> Tambah menu
        </button>
        {section.portions.length > 1 && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onRemovePortion(section.id, section.portions[section.portions.length - 1].id);
            }}
            className='mt-4 bg-white text-black px-4 py-2 text-xs rounded flex items-center gap-2 border border-primary'
          >
            <FaMinus /> Hapus menu
          </button>
        )}
      </div>
    </div>
  );
}