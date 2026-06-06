import axios from 'axios';
import { PRODUCTS, CATEGORIES } from '../data/data';

const http = axios.create({ baseURL: '/api' });

export async function fetchProducts(params = {}) {
  try {
    const { data } = await http.get('/products', { params });
    return data;
  } catch {
    // fallback to static data when backend is unavailable
    return applyFilters(PRODUCTS, params);
  }
}

export async function fetchCategories() {
  try {
    const { data } = await http.get('/categories');
    return data;
  } catch {
    return CATEGORIES;
  }
}

export async function createBooking(payload) {
  const { data } = await http.post('/bookings', payload);
  return data;
}

export async function createOrder(payload) {
  const { data } = await http.post('/orders', payload);
  return data;
}

function applyFilters(products, { cat, brand, skill, maxPrice, sort, tags } = {}) {
  let r = products.filter(p =>
    (cat      ? cat.split(',').includes(p.cat)     : true) &&
    (brand    ? brand.split(',').includes(p.brand) : true) &&
    (skill    ? skill.split(',').includes(p.skill) : true) &&
    (maxPrice ? p.price <= Number(maxPrice)        : true) &&
    (tags     ? tags.split(',').some(t => (p.tags||[]).includes(t)) : true)
  );
  if (sort === 'low')    r = [...r].sort((a,b) => a.price - b.price);
  else if (sort === 'high')   r = [...r].sort((a,b) => b.price - a.price);
  else if (sort === 'rating') r = [...r].sort((a,b) => b.rating - a.rating);
  else r = [...r].sort((a,b) => (b.tags?.length||0) - (a.tags?.length||0));
  return r;
}
