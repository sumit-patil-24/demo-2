// SAMPLE DATA ONLY – used when VITE_DEMO_MODE=true.
const img = (s, w = 800) => `https://picsum.photos/seed/${s}/${w}/500`
export const categories = ['Food & Café', 'Retail', 'Home Services', 'Health & Wellness', 'Crafts & Gifts', 'Education']
export const locations = ['Pune', 'Mumbai', 'Nashik']
export const businesses = [
  ['b1','Chai & Chapters','Food & Café','Pune','Book café serving single-estate teas and fresh bakes.',4.8],
  ['b2','Kaveri Handlooms','Retail','Pune','Handwoven sarees and cotton wear from family looms.',4.6],
  ['b3','FixIt Home Care','Home Services','Mumbai','Plumbing, electrical and appliance repair within 24 hours.',4.4],
  ['b4','Prana Studio','Health & Wellness','Pune','Small-batch yoga and breathwork classes.',4.9],
  ['b5','Clay & Co.','Crafts & Gifts','Nashik','Wheel-thrown ceramics and custom gift sets.',4.7],
  ['b6','BrightPath Tutors','Education','Mumbai','Maths and science tutoring for grades 6–12.',4.5],
  ['b7','Green Basket Grocers','Retail','Nashik','Organic produce delivered from farms nearby.',4.3],
].map(([id,name,category,location,description,rating],i)=>({id,name,category,location,description,rating,
  image:img(id),email:`hello@${id}.example`,phone:`+91 98765 4321${i}`,hours:'Mon–Sat, 9am–7pm'}))
export const products = businesses.flatMap((b) => [1,2,3].map((n) => ({
  id:`${b.id}-p${n}`, businessId:b.id, name:`${b.name} – Offer ${n}`, price:199*n+100, image:img(`${b.id}p${n}`,400) })))
