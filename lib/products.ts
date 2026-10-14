export type Product = {
  id: string; slug: string; name: string; description: string; price: number;
  image_url: string; category: string; material: string; stock: number; featured: boolean;
};
export const fallbackProducts: Product[] = [
  {id:"1",slug:"weyvo-silver-link",name:"Silver Link",description:"A clean stainless-steel link bracelet with a polished silver finish, made for everyday wear.",price:899,image_url:"/images/weyvo-bracelet-1.webp",category:"Classic",material:"Stainless steel",stock:20,featured:true},
  {id:"2",slug:"weyvo-geo-link",name:"Geo Link",description:"Geometric textured accents meet a brushed silver finish in this modern statement bracelet.",price:999,image_url:"/images/weyvo-bracelet-2.webp",category:"Modern",material:"Stainless steel",stock:15,featured:true},
  {id:"3",slug:"weyvo-everyday-silver",name:"Everyday Silver",description:"A versatile silver-tone bracelet with a comfortable linked design.",price:799,image_url:"/images/weyvo-bracelet-3.webp",category:"Everyday",material:"Stainless steel",stock:25,featured:false},
  {id:"4",slug:"weyvo-signature",name:"Signature",description:"A refined silver bracelet designed to elevate casual and formal looks.",price:1099,image_url:"/images/weyvo-bracelet-4.webp",category:"Signature",material:"Stainless steel",stock:10,featured:true}
];
