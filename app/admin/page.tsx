"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { ArrowUpRight, Box, ImagePlus, LogOut, Package, RefreshCw, ShieldCheck, ShoppingBag, TrendingUp, UploadCloud } from "lucide-react";

type Product = { id: string; name: string; slug: string; price: number; stock: number; category: string; image_url: string; active: boolean; featured: boolean };
type Order = { id: string; order_number: string; customer_name: string; email: string; total: number; status: string; created_at: string; payment_status: string };
const currency = (n: number) => new Intl.NumberFormat("en-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 }).format(Number(n || 0);
const statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default function AdminDashboard() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState<"overview" | "products" | "orders">("overview");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const load = useCallback(async () => {
    if (!supabase) { setError("Supabase isn't configured. Add the environment variables in Vercel."); setLoading(false); return; }
    setLoading(true); setError("");
    const { data: auth } = await supabase.auth.getSession();
    setSession(auth.session);
    if (!auth.session) { setAdmin(false); setLoading(false); return; }
    const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", auth.session.user.id).maybeSingle();
    if (profileError || profile?.role !== "admin") {
      setAdmin(false);
      setError("This account does not have the admin role yet. Ask the project owner to grant admin access in Supabase.");
      setLoading(false); return;
    }
    setAdmin(true);
    const [p, o] = await Promise.all([
      supabase.from("products").select("id,name,slug,price,stock,category,image_url,active,featured").order("created_at", { ascending: false }),
      supabase.from("orders").select("id,order_number,customer_name,email,total,status,created_at,payment_status").order("created_at", { ascending: false }).limit(100)
    ]);
    if (p.error) setError(p.error.message); else setProducts((p.data || []) as Product[]);
    if (o.error) setError(o.error.message); else setOrders((o.data || []) as Order[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault(); if (!supabase) return;
    setBusy("login"); setError(""); setNotice("");
    const { error: e1 } = await supabase.auth.signInWithPassword({ email, password });
    if (e1) setError(e1.message); else { setPassword(""); await load(); }
    setBusy("");
  }

  async function signOut() { await supabase?.auth.signOut(); setSession(null); setAdmin(false); setProducts([]); setOrders([]); }

  async function saveProduct(id: string, patch: Partial<Product>) {
    if (!supabase || !admin) return;
    setBusy(id); setError(""); setNotice("");
    const { error: e1 } = await supabase.from("products").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
    if (e1) setError(e1.message); else { setProducts(old => old.map(p => p.id === id ? { ...p, ...patch } : p)); setNotice("Product saved."); }
    setBusy("");
  }

  async function uploadImage(product: Product, file?: File) {
    if (!supabase || !file) return;
    if (!["image/webp", "image/jpeg", "image/png"].includes(file.type)) { setError("Use a WEBP, JPG, or PNG image."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Images must be 5 MB or smaller."); return; }
    setBusy(product.id); setError(""); setNotice("");
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.-]/g, "-");
    const path = `${product.slug}/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) { setError(uploadError.message); setBusy(""); return; }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    const { error: updateError } = await supabase.from("products").update({ image_url: data.publicUrl, updated_at: new Date().toISOString() }).eq("id", product.id);
    if (updateError) setError(updateError.message);
    else { setProducts(old => old.map(p => p.id === product.id ? { ...p, image_url: data.publicUrl } : p)); setNotice(`Photo uploaded for ${product.name}.`); }
    setBusy("");
  }

  async function updateOrder(id: string, status: string) {
    if (!supabase || !admin) return;
    setBusy(id); setError(""); setNotice("");
    const { error: e1 } = await supabase.from("orders").update({ status }).eq("id", id);
    if (e1) setError(e1.message); else { setOrders(old => old.map(o => o.id === id ? { ...o, status } : o)); setNotice("Order status updated."); }
    setBusy("");
  }

  const revenue = orders.filter(o => !["cancelled"].includes(o.status)).reduce((s, o) => s + Number(o.total || 0), 0);
  const pending = orders.filter(o => ["pending", "confirmed", "processing"].includes(o.status)).length;

  if (loading) return <main className="admin-shell"><div className="admin-loading"><div className="admin-mark">w.</div><p>Preparing your Weyvo dashboard…</p></div></main>;

  if (!session || !admin) return <main className="admin-shell"><section className="admin-login"><a href="/" className="admin-brand">weyvo<span>.</span></a><div className="admin-eyebrow"><ShieldCheck size={15}/> STORE CONTROL CENTRE</div><h1>Welcome back.</h1><p className="admin-muted">Sign in with your store administrator account to manage products, photos, and orders.</p>{error && <div className="admin-alert">{error}</div>}{!session ? <form onSubmit={signIn} className="admin-login-form"><label>Email address<input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="username" placeholder="you@weyvo.com"/></label><label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" placeholder="Your password"/></label><button className="admin-button" disabled={busy === "login"}>{busy === "login" ? "Signing in…" : "Sign in to dashboard"} <ArrowUpRight size={16}/></button></form> : <button className="admin-button" onClick={signOut}>Sign out and switch account <LogOut size={16}/></button>}<a href="/" className="admin-back">← Back to the storefront</a></section></main>;

  return <main className="admin-shell"><aside className="admin-sidebar"><a href="/" className="admin-brand">weyvo<span>.</span></a><div className="admin-side-label">WORKSPACE</div>{(["overview", "products", "orders"] as const).map(t => <button key={t} onClick={() => setTab(t)} className={tab === t ? "admin-nav active" : "admin-nav"}>{t === "overview" ? <TrendingUp size={17}/> : t === "products" ? <Box size={17}/> : <ShoppingBag size={17}/>} {t[0].toUpperCase()+t.slice(1)}{t === "orders" && pending > 0 && <i>{pending}</i>}</button>)}<div className="admin-side-bottom"><span className="admin-live-dot"/> Supabase connected<button onClick={signOut}><LogOut size={15}/> Sign out</button></div></aside><section className="admin-main"><header className="admin-topbar"><div><div className="admin-eyebrow">WEYVO / MANAGEMENT</div><h1>{tab === "overview" ? "Store overview" : tab === "products" ? "Products & imagery" : "Order management"}</h1></div><button className="admin-refresh" onClick={() => void load()}><RefreshCw size={15}/> Refresh data</button></header>{error && <div className="admin-alert">{error}</div>}{notice && <div className="admin-notice">{notice}</div>}
  {tab === "overview" && <><div className="admin-welcome"><div><span>YOUR STORE, AT A GLANCE</span><h2>Good things are<br/>in the <em>details.</em></h2><p>Keep your catalogue polished and every order moving.</p></div><div className="admin-welcome-mark">W<span>.</span></div></div><div className="admin-stats"><article><span><ShoppingBag size={17}/> ORDERS</span><strong>{orders.length}</strong><small>Latest 100 orders</small></article><article><span><TrendingUp size={17}/> ORDER VALUE</span><strong>{currency(revenue)}</strong><small>Excluding cancelled orders</small></article><article><span><Package size={17}/> TO FULFIL</span><strong>{pending}</strong><small>Pending, confirmed or processing</small></article><article><span><Box size={17}/> PRODUCTS</span><strong>{products.length}</strong><small>{products.filter(p => p.active).length} currently active</small></article></div><div className="admin-panels"><section className="admin-panel"><div className="admin-panel-head"><div><h3>Recent orders</h3><p>Track the latest customer purchases</p></div><button onClick={() => setTab("orders")}>All orders ↗</button></div>{orders.slice(0,5).length ? orders.slice(0,5).map(o => <div className="admin-mini-order" key={o.id}><div className="admin-order-avatar">{(o.customer_name || "W").slice(0,1).toUpperCase()}</div><div className="admin-mini-name"><b>{o.customer_name}</b><small>{o.order_number}</small></div><strong>{currency(o.total)}</strong><span className={`admin-status ${o.status}`}>{o.status}</span></div>) : <p className="admin-empty">Orders will appear here after customers check out.</p>}</section><section className="admin-panel"><div className="admin-panel-head"><div><h3>Catalogue health</h3><p>Products that may need attention</p></div><button onClick={() => setTab("products")}>Manage ↗</button></div>{products.filter(p => p.stock <= 5 || !p.image_url || !p.active).slice(0,6).map(p => <div className="admin-health-row" key={p.id}><span className={p.stock <= 5 ? "admin-health-dot warning" : "admin-health-dot"}/><div><b>{p.name}</b><small>{!p.image_url ? "Photo missing" : p.stock <= 5 ? `Only ${p.stock} in stock` : "Inactive listing"}</small></div><button onClick={() => setTab("products")}>Review</button></div>)}{products.every(p => p.stock > 5 && p.image_url && p.active) && <p className="admin-empty">Your catalogue looks healthy. Keep it that way ✦</p>}</section></div></>}
  {tab === "products" && <><div className="admin-toolbar"><div><h2>Your collection</h2><p>Edit prices, stock, visibility, and product photos.</p></div><span className="admin-count">{products.length} PRODUCTS</span></div><div className="admin-product-list">{products.map(p => <article className="admin-product-row" key={p.id}><div className="admin-product-thumb">{p.image_url ? <img src={p.image_url} alt={p.name}/> : <ImagePlus size={24}/>}</div><div className="admin-product-identity"><b>{p.name}</b><small>{p.category} · {p.slug}</small><span className={p.active ? "admin-pill enabled" : "admin-pill"}>{p.active ? "Live in store" : "Hidden"}</span></div><label className="admin-field">PRICE (EGP)<input type="number" min="0" defaultValue={p.price} key={p.id+"price"+p.price} onBlur={e => { const n=Number(e.target.value); if(n!==Number(p.price)&&n>=0) void saveProduct(p.id,{price:n}); }}/></label><label className="admin-field">STOCK<input type="number" min="0" defaultValue={p.stock} key={p.id+"stock"+p.stock} onBlur={e => { const n=Number(e.target.value); if(n!==Number(p.stock)&&n>=0) void saveProduct(p.id,{stock:n}); }}/></label><label className="admin-upload"><input type="file" accept="image/webp,image/jpeg,image/png" onChange={e => { void uploadImage(p,e.target.files?.[0]); e.currentTarget.value=""; }}/><UploadCloud size={16}/><span>{busy===p.id ? "Uploading…" : "Upload photo"}</span></label><button className="admin-visibility" onClick={() => void saveProduct(p.id,{active:!p.active})}>{p.active ? "Hide" : "Publish"}</button></article>)}</div><p className="admin-footnote">Product images are stored in the public Supabase Storage bucket. Supported: WEBP, JPG, PNG up to 5 MB.</p></>}
  {tab === "orders" && <><div className="admin-toolbar"><div><h2>Orders</h2><p>Update fulfilment status as orders move through your workflow.</p></div><span className="admin-count">{orders.length} RECENT ORDERS</span></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>DATE</th><th>TOTAL</th><th>PAYMENT</th><th>STATUS</th></tr></thead><tbody>{orders.map(o => <tr key={o.id}><td><b>{o.order_number}</b></td><td>{o.customer_name}<small>{o.email}</small></td><td>{new Date(o.created_at).toLocaleDateString("en-EG",{day:"2-digit",month:"short",year:"numeric"})}</td><td><b>{currency(o.total)}</b></td><td><span className="admin-payment">{o.payment_status || "unpaid"}</span></td><td><select className="admin-status-select" value={o.status} disabled={busy===o.id} onChange={e => void updateOrder(o.id,e.target.value)}>{statuses.map(s => <option key={s} value={s}>{s[0].toUpperCase()+s.slice(1)}</option>)}</select></td></tr>)}</tbody></table>{!orders.length && <p className="admin-empty">No orders yet. New orders will show here.</p>}</div></>}
  </section></main>;
}
