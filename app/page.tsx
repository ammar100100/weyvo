"use client";
import { useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowRight, Check, Heart, Menu, Search, ShoppingBag, Sparkles, X } from "lucide-react";
import { fallbackProducts, type Product } from "../lib/products";
import { supabase } from "../lib/supabase";

const money = (n:number) => `EGP ${n.toLocaleString("en-EG")}`;
export default function Home() {
  const [products,setProducts] = useState<Product[]>(fallbackProducts);
  const [cart,setCart] = useState<Record<string,number>>({});
  const [drawer,setDrawer] = useState(false);
  const [search,setSearch] = useState("");
  const [category,setCategory] = useState("All");
  const [notice,setNotice] = useState("");
  const [checkout,setCheckout] = useState(false);
  const [customer,setCustomer] = useState({name:"",email:"",phone:"",address:""});
  useEffect(()=>{ if(!supabase) return; supabase.from("products").select("id,slug,name,description,price,image_url,category,material,stock,featured").eq("active",true).order("featured",{ascending:false}).then(({data})=>{if(data?.length)setProducts(data as Product[])}); },[]);
  const categories = ["All",...Array.from(new Set(products.map(p=>p.category)))];
  const visible = useMemo(()=>products.filter(p=>(category==="All"||p.category===category)&&p.name.toLowerCase().includes(search.toLowerCase())),[products,category,search]);
  const count = Object.values(cart).reduce((a,b)=>a+b,0);
  const total = products.reduce((sum,p)=>sum+(cart[p.id]||0)*Number(p.price),0);
  const add = (p:Product)=>{setCart(c=>({...c,[p.id]:(c[p.id]||0)+1}));setNotice(`${p.name} added to your bag`);setDrawer(true);};
  async function placeOrder(e:React.FormEvent) {
    e.preventDefault();
    if(!supabase){setNotice("Connect Supabase in .env.local to save real orders.");return;}
    const rows=products.filter(p=>(cart[p.id]||0)>0);
    const {data:order,error}=await supabase.from("orders").insert({
      customer_name:customer.name,email:customer.email,phone:customer.phone,
      shipping_address:{address:customer.address,country:"Egypt"},subtotal:total,shipping_cost:0,total,
      payment_method:"cash_on_delivery",status:"pending"
    }).select("id,order_number").single();
    if(error||!order){setNotice(error?.message||"Could not place order.");return;}
    const items=rows.map(p=>({order_id:order.id,product_id:p.id,product_name:p.name,product_image:p.image_url,unit_price:p.price,quantity:cart[p.id],line_total:Number(p.price)*cart[p.id]}));
    const {error:itemError}=await supabase.from("order_items").insert(items);
    if(itemError){setNotice("Order created but item saving failed. Please contact support.");return;}
    setCart({});setCheckout(false);setNotice(`Thank you! Order ${order.order_number} has been received.`);setDrawer(false);
  }
  return <main>
    <div className="announcement">COMPLIMENTARY SHIPPING ON ORDERS OVER EGP 1,500 <span>✦</span> MADE FOR YOUR EVERYDAY</div>
    <header className="nav wrap">
      <button className="iconbtn mobile-menu" aria-label="Menu"><Menu size={20}/></button>
      <a className="wordmark" href="#">weyvo<span>.</span></a>
      <nav><a href="#shop">Shop all</a><a href="#story">Our story</a><a href="#promise">The Weyvo promise</a></nav>
      <div className="nav-actions"><label className="searchbox"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Find your piece"/></label><button className="bag" onClick={()=>setDrawer(true)}><ShoppingBag size={19}/> <span>Bag ({count})</span></button></div>
    </header>
    <section className="hero wrap">
      <div className="hero-copy"><div className="eyebrow"><Sparkles size={14}/> THE EVERYDAY COLLECTION</div><h1>Little details.<br/><em>Lasting impact.</em></h1><p>Jewellery that feels like you. Discover considered bracelets designed to go wherever your day takes you.</p><a className="primary" href="#shop">Explore the collection <ArrowRight size={17}/></a><div className="hero-note"><span className="dot"></span> YOUR NEW EVERYDAY FAVOURITE</div></div>
      <div className="hero-art"><div className="art-label">01 / SIGNATURE SILVER</div><img src="/images/weyvo-bracelet-1.webp" alt="Weyvo silver link bracelet"/><div className="round-stamp">MADE TO<br/>MOVE WITH<br/>YOU <ArrowDownRight size={18}/></div></div>
    </section>
    <section className="ticker"><span>YOUR STYLE, YOUR STORY</span><b>✳</b><span>EVERYDAY ICONS</span><b>✳</b><span>MADE TO BE WORN</span><b>✳</b><span>YOUR STYLE, YOUR STORY</span></section>
    <section id="shop" className="shop wrap">
      <div className="section-head"><div><div className="eyebrow">THE EDIT</div><h2>Find your <em>forever piece.</em></h2></div><span className="count-label">{visible.length} PIECES</span></div>
      <div className="filters">{categories.map(c=><button key={c} onClick={()=>setCategory(c)} className={category===c?"filter active":"filter"}>{c}</button>)}</div>
      <div className="products">{visible.map((p,i)=><article className="product" key={p.id}><div className={`product-image shade-${i%4}`}><span className="product-tag">{p.featured?"THE WEYVO EDIT":p.category.toUpperCase()}</span><button className="heart" aria-label="Save item"><Heart size={17}/></button><img src={p.image_url||"/images/weyvo-bracelet-1.webp"} alt={p.name}/><button className="quick-add" onClick={()=>add(p)}>Add to bag <span>+</span></button></div><div className="product-info"><div><h3>{p.name}</h3><p>{p.material} · {p.category}</p></div><strong>{money(Number(p.price))}</strong></div></article>)}</div>
      <div className="shop-foot"><span>THOUGHTFULLY CHOSEN. EFFORTLESSLY WORN.</span><a href="#promise">Why Weyvo <ArrowRight size={15}/></a></div>
    </section>
    <section id="story" className="story"><div className="story-image"><img src="/images/weyvo-bracelet-3.webp" alt="Silver bracelet detail"/></div><div className="story-copy"><div className="eyebrow">LESS, BUT BETTER</div><h2>Made for the moments<br/>that make <em>you.</em></h2><p>Weyvo is about the little things that make a look feel complete. Thoughtful details, easy-to-wear design, and pieces you reach for again and again.</p><a href="#shop" className="text-link">Meet your new favourite <ArrowRight size={16}/></a><div className="story-number">W / 001</div></div></section>
    <section id="promise" className="promise wrap"><div><span className="promise-icon">01</span><h3>Everyday ready</h3><p>Versatile pieces designed to fit into your everyday rotation.</p></div><div><span className="promise-icon">02</span><h3>Thoughtful details</h3><p>Modern textures and clean lines, made to feel personal.</p></div><div><span className="promise-icon">03</span><h3>Easy gifting</h3><p>A little something special for yourself or someone you love.</p></div></section>
    <footer><div className="footer-top wrap"><a className="wordmark" href="#">weyvo<span>.</span></a><p>Little details. Lasting impact.</p><a href="#shop">SHOP THE EDIT <ArrowRight size={15}/></a></div><div className="footer-bottom wrap"><span>© 2026 WEYVO. ALL RIGHTS RESERVED.</span><span>MADE FOR YOUR EVERYDAY.</span></div></footer>
    {drawer&&<div className="overlay" onClick={()=>setDrawer(false)}><aside className="drawer" onClick={e=>e.stopPropagation()}><div className="drawer-head"><h2>{checkout?"Checkout":"Your bag"} <span>({count})</span></h2><button className="iconbtn" onClick={()=>{setDrawer(false);setCheckout(false)}}><X/></button></div>{notice&&<p className="notice"><Check size={15}/>{notice}</p>}{!checkout?<><div className="cart-lines">{products.filter(p=>cart[p.id]).map(p=><div className="cart-line" key={p.id}><img src={p.image_url} alt=""/><div className="line-main"><b>{p.name}</b><span>{money(Number(p.price))}</span><div className="quantity"><button onClick={()=>setCart(c=>({...c,[p.id]:Math.max(0,(c[p.id]||0)-1)}))}>−</button><span>{cart[p.id]}</span><button onClick={()=>setCart(c=>({...c,[p.id]:(c[p.id]||0)+1}))}>+</button></div></div><button className="remove" onClick={()=>setCart(c=>({...c,[p.id]:0}))}>Remove</button></div>)}</div>{count===0&&<div className="empty"><ShoppingBag size={28}/><p>Your bag is waiting for something good.</p><button className="primary" onClick={()=>setDrawer(false)}>Explore pieces</button></div>}<div className="cart-bottom"><div className="subtotal"><span>Subtotal</span><b>{money(total)}</b></div><small>Shipping calculated at checkout.</small><button disabled={!count} className="primary full" onClick={()=>{setCheckout(true);setNotice("")}}>Continue to checkout <ArrowRight size={16}/></button><p className="secure">Secure checkout · Cash on delivery</p></div></>:<form className="checkout-form" onSubmit={placeOrder}><p>Delivery details</p><input required placeholder="Full name" value={customer.name} onChange={e=>setCustomer({...customer,name:e.target.value})}/><input required type="email" placeholder="Email address" value={customer.email} onChange={e=>setCustomer({...customer,email:e.target.value})}/><input placeholder="Phone number" value={customer.phone} onChange={e=>setCustomer({...customer,phone:e.target.value})}/><textarea required placeholder="Full delivery address" value={customer.address} onChange={e=>setCustomer({...customer,address:e.target.value})}/><div className="subtotal"><span>Total</span><b>{money(total)}</b></div><button className="primary full" type="submit">Place order <ArrowRight size={16}/></button><button type="button" className="back" onClick={()=>setCheckout(false)}>Back to bag</button></form>}</aside></div>}
  </main>
}
