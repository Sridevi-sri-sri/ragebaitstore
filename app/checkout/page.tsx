'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { AlertCircle, Loader2, CreditCard, RefreshCcw } from 'lucide-react';
import Image from 'next/image';

function loadScript(src: string) {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items: cartItems, subtotal, user } = useCart();
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'processing' | 'payment-error'>('idle');
  const [existingOrderId, setExistingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'idle') {
      loadScript('https://checkout.razorpay.com/v1/checkout.js');
    }
  }, [status]);

  if (!user) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-muted">Please sign in to checkout.</p>
      </div>
    );
  }

  if (cartItems.length === 0 && !existingOrderId) {
    return (
      <div className="flex h-[60vh] items-center justify-center flex-col gap-4">
        <p className="text-muted">Your cart is empty.</p>
        <button onClick={() => router.push('/products')} className="text-primary hover:underline">
          Go back to shopping
        </button>
      </div>
    );
  }

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleCheckout = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate()) return;
    setStatus('processing');

    try {
      let currentOrderId = existingOrderId;

      // 1. Create order in Supabase if we don't have one pending
      if (!currentOrderId) {
        const orderRes = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.uid,
            cartItems,
            shipping: formData,
            totalAmount: subtotal,
          }),
        });

        if (!orderRes.ok) throw new Error('Failed to create order');
        const orderData = await orderRes.json();
        currentOrderId = orderData.orderId;
        setExistingOrderId(currentOrderId as string);
      }

      if (!currentOrderId) throw new Error('No order ID');

      // 2. Create Razorpay order
      const rpRes = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: currentOrderId }),
      });

      if (!rpRes.ok) throw new Error('Failed to create Razorpay order');
      const rpData = await rpRes.json();

      // 3. Open Razorpay Popup
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: rpData.amount,
        currency: "INR",
        name: "RageBait Store",
        description: "Test Transaction",
        image: "/favicon.ico", // Using favicon as logo placeholder
        order_id: rpData.razorpayOrderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/verify-razorpay-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            if (!verifyRes.ok) throw new Error('Payment verification failed');
            
            router.push(`/order-confirmation/${currentOrderId}`);
          } catch (err) {
            setStatus('payment-error');
          }
        },
        prefill: {
          name: formData.name,
          email: user.email || '',
          contact: formData.phone,
        },
        theme: {
          color: "#000000",
        },
        modal: {
          ondismiss: function() {
            setStatus('payment-error');
          }
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error(error);
      setStatus('payment-error');
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-10">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Form Section */}
        <div>
          <h2 className="text-xl font-semibold mb-6 border-b border-border pb-2">Shipping Information</h2>
          <form onSubmit={handleCheckout} className="space-y-5">
            {['name', 'address', 'city', 'postalCode', 'phone'].map((field) => (
              <div key={field}>
                <label htmlFor={field} className="block text-sm font-medium text-foreground capitalize mb-1">
                  {field.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  type="text"
                  id={field}
                  name={field}
                  value={(formData as any)[field]}
                  onChange={handleChange}
                  className={`w-full rounded-lg border bg-surface px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors[field] ? 'border-error focus:ring-error' : 'border-border'
                  }`}
                  disabled={status === 'processing' || !!existingOrderId}
                />
                {errors[field] && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-error">
                    <AlertCircle size={14} /> <span>{errors[field]}</span>
                  </div>
                )}
              </div>
            ))}

            {status === 'payment-error' && (
               <div className="mt-4 p-4 rounded-lg bg-surface border border-error text-error flex items-start gap-3">
                 <AlertCircle className="mt-0.5 shrink-0" size={18} />
                 <div>
                   <p className="font-semibold">Payment was not completed.</p>
                   <p className="text-sm mt-1">You can try again using the button below. Your order is safely saved.</p>
                 </div>
               </div>
            )}

            <button
              type={existingOrderId ? "button" : "submit"}
              onClick={existingOrderId ? () => handleCheckout() : undefined}
              disabled={status === 'processing'}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-70 mt-8"
            >
              {status === 'processing' ? (
                <><Loader2 size={18} className="animate-spin" /> Processing...</>
              ) : existingOrderId ? (
                <><RefreshCcw size={18} /> Retry Payment</>
              ) : (
                <><CreditCard size={18} /> Pay ${subtotal.toFixed(2)}</>
              )}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-border h-fit">
          <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
          <ul className="space-y-4 mb-6">
            {cartItems.map((item: any) => (
              <li key={item.id} className="flex items-center gap-4 py-2">
                <div className="relative w-16 h-16 rounded-md overflow-hidden bg-background border border-border shrink-0">
                  <Image 
                    src={item.product?.image_url || '/placeholder.png'} 
                    alt={item.product?.name || 'Product'} 
                    fill 
                    className="object-cover" 
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium">{item.product?.name}</h3>
                  <p className="text-xs text-muted mt-0.5">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold">
                  ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                </p>
              </li>
            ))}
          </ul>
          
          <div className="border-t border-border pt-4 flex items-center justify-between">
            <span className="font-semibold text-foreground">Total</span>
            <span className="text-lg font-bold text-primary">${subtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </main>
  );
}