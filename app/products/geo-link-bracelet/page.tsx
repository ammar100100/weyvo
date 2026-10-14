"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { supabase } from "../../../lib/supabase";

const money = (n: number) => `EGP ${n.toLocaleString("en-EG")}`;

export default function GeoLinkBraceletPage() {
  const [quantity, setQuantity] = useState(1);
  const [customer, setCustomer] = useState({ name: "", phone: "", address: "" });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const price = 999;

  async function placeOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) {
      setNotice("Ordering is temporarily unavailable. Please try again later.");
      return;
    }
    setBusy(true);
    setNotice("");
    try {
      const { data: order, error } = await supabase.from("orders").insert({
        customer_name: customer.name.trim(),
        email: null,
        phone: customer.phone.trim(),
        shipping_address: { address: customer.address.trim(), country: "Egypt" },
        subtotal: price * quantity,
        shipping_cost: 0,
        total: price * quantity,
        payment_method: "cash_on_delivery",
        status: "pending"
      }).select("id,order_number").single();
      if (error || !order) throw error || new Error("Could not create order.");
      const { error: itemError } = await supabase.from("order_items").insert([{
        order_id: order.id,
        product_id: null,
        product_name: "Weyvo Geo Link Bracelet",
        product_image: "/images/geo-link-bracelet-1.webp",
        unit_price: price,
        quantity,
        line_total: price * quantity
      }]);
      if (itemError) {
        setNotice(`Order ${order.order_number} was created, but its item could not be saved. Please contact us with this order number.`);
      } else {
        setNotice(`Order received! Your order number is ${order.order_number}. We will call you to confirm delivery.`);
        setCustomer({ name: "", phone: "", address: "" });
        setQuantity(1);
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not place your order. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="geo-page">
    <header className="geo-nav">
      <Link href="/" className="geo-back"><ArrowLeft size={16}/> Back to Weyvo</Link>
      <Link href="/" className="geo-logo">weyvo<span>.</span></Link>
      <span className="geo-nav-note">THE DETAILS EDIT</span>
    </header>
    <div className="geo-breadcrumb">HOME / BRACELETS / GEO LINK</div>
    <section className="geo-product">
      <div className="geo-gallery">
        <div className="geo-main-image" role="img" aria-label="Silver geometric link bracelet product illustration">
          <div className="geo-orbit"><div className="geo-bracelet"><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/></div></div>
          <div className="geo-image-caption">WEYVO · GEO LINK</div>
        </div>
        <div className="geo-thumbs"><div className="geo-thumb"><div className="geo-mini-bracelet"/></div><div className="geo-thumb geo-thumb-dark"><div className="geo-mini-bracelet"/></div><div className="geo-thumb geo-thumb-close"><div className="geo-mini-bracelet"/></div></div>
        <p className="geo-image-note">Product preview illustration. Replace with approved, unbranded product photos before launch.</p>
      </div>
      <div className="geo-details">
        <div className="geo-kicker"><span/> NEW ARRIVAL</div>
        <h1>Geo Link<br/><em>Bracelet</em></h1>
        <p className="geo-intro">A bold geometric link design with a brushed silver finish. A modern everyday piece designed to make a subtle statement.</p>
        <div className="geo-price">{money(price)} <span>Cash on delivery</span></div>
        <div className="geo-rule"/>
        <div className="geo-feature"><Check size={16}/> Clean geometric link design</div>
        <div className="geo-feature"><Check size={16}/> Silver-tone finish</div>
        <div className="geo-feature"><Check size={16}/> Easy phone-based order — no email needed</div>
        <div className="geo-quantity"><span>QUANTITY</span><div><button type="button" onClick={()=>setQuantity(q=>Math.max(1,q-1))} aria-label="Decrease quantity">−</button><b>{quantity}</b><button type="button" onClick={()=>setQuantity(q=>Math.min(10,q+1))} aria-label="Increase quantity">+</button></div></div>
        <div className="geo-total"><span>Total</span><strong>{money(price*quantity)}</strong></div>
        <form className="geo-order-form" onSubmit={placeOrder}>
          <h2>Order without email</h2>
          <p>Enter your delivery details. We’ll call you to confirm your order.</p>
          <label>Full name<input required minLength={2} autoComplete="name" value={customer.name} onChange={e=>setCustomer({...customer,name:e.target.value})} placeholder="Your name"/></label>
          <label>Phone number<input required type="tel" inputMode="tel" autoComplete="tel" minLength={7} value={customer.phone} onChange={e=>setCustomer({...customer,phone:e.target.value})} placeholder="Your phone number"/></label>
          <label>Delivery address<textarea required minLength={8} autoComplete="street-address" value={customer.address} onChange={e=>setCustomer({...customer,address:e.target.value})} placeholder="Governorate, area, street, building"/></label>
          <button className="geo-submit" type="submit" disabled={busy}><ShoppingBag size={17}/>{busy?"Placing order…":`Place order · ${money(price*quantity)}`}</button>
          {notice&&<div className="geo-notice" role="status">{notice}</div>}
          <div className="geo-trust"><span><ShieldCheck size={15}/> Your details stay private</span><span><Truck size={15}/> Cash on delivery</span></div>
        </form>
      </div>
    </section>
    <footer className="geo-footer"><Link href="/">weyvo<span>.</span></Link><span>Little details. Lasting impact.</span></footer>
  </main>;
}
