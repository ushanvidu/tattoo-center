import axios from 'axios';
import { PRODUCTS, CATEGORIES } from '../data/data';
import { searchProducts } from './search';

const BASE = import.meta.env.VITE_API_URL || '/api';

const http = axios.create({ baseURL: BASE });

// Customer/public calls carry the customer token only.
http.interceptors.request.use(config => {
  const userToken = localStorage.getItem('tc_user_token');
  if (userToken) config.headers['Authorization'] = `Bearer ${userToken}`;
  return config;
});

// Admin calls carry the admin token only. Kept as a separate client because
// the two tokens are signed with the same secret — sending a customer token to
// an admin route used to succeed, so the shop owner being logged in as both
// silently decided which privileges applied.
const adminHttp = axios.create({ baseURL: BASE });

adminHttp.interceptors.request.use(config => {
  const adminToken = localStorage.getItem('tc_admin_token');
  if (adminToken) config.headers['Authorization'] = `Bearer ${adminToken}`;
  return config;
});

// ─── User Auth ────────────────────────────────────────────────────────────────

export async function authRegister(payload) {
  const { data } = await http.post('/auth/register', payload);
  return data; // { token, user }
}

export async function authLogin(payload) {
  const { data } = await http.post('/auth/login', payload);
  return data; // { token, user }
}

export async function authMe() {
  const { data } = await http.get('/auth/me');
  return data; // { user }
}

export async function authUpdateProfile(payload) {
  const { data } = await http.patch('/auth/profile', payload);
  return data; // { user }
}

export async function authChangePassword(payload) {
  const { data } = await http.patch('/auth/password', payload);
  return data;
}

// ─── File Upload ─────────────────────────────────────────────────────────────

export async function uploadFile(file) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await adminHttp.post('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data; // { url, filename, type, size }
}

// ─── Public ──────────────────────────────────────────────────────────────────

export async function fetchProducts(params = {}) {
  try {
    const { data } = await http.get('/products', { params });
    return data;
  } catch {
    return applyFilters(PRODUCTS, params);
  }
}

// Full single-product record (includes the `images` gallery, which the list
// endpoint above omits to keep listing responses light).
export async function fetchProduct(id) {
  try {
    const { data } = await http.get(`/products/${id}`);
    return data;
  } catch {
    return PRODUCTS.find(p => p.id === id) || null;
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

export async function adminUpdateCategoryMedia(id, payload) {
  const { data } = await adminHttp.patch(`/categories/${id}`, payload);
  return data;
}

export async function createBooking(payload) {
  const { data } = await http.post('/bookings', payload);
  return data;
}

export async function createOrder(payload) {
  const { data } = await http.post('/orders', payload);
  return data;
}

// The server prices the order itself; we only say which order to sign for.
export async function getPayhereHash(orderId, currency = 'LKR') {
  const { data } = await http.post('/payment/payhere-hash', { orderId, currency });
  return data; // { hash, merchant_id, sandbox, order_id, amount, currency }
}

// ─── Q&A (legacy admin key path) ─────────────────────────────────────────────


export async function fetchPublicQuestions() {
  const { data } = await http.get('/questions');
  return data;
}

export async function submitQuestion(payload) {
  const { data } = await http.post('/questions', payload);
  return data;
}

export async function fetchAllQuestions() {
  const { data } = await adminHttp.get('/questions/admin');
  return data;
}

export async function answerQuestion(id, answer, isPublic = true) {
  const { data } = await adminHttp.patch(`/questions/${id}/answer`, { answer, public: isPublic });
  return data;
}

export async function deleteQuestion(id) {
  const { data } = await adminHttp.delete(`/questions/${id}`);
  return data;
}

// ─── Admin Auth ───────────────────────────────────────────────────────────────

export async function adminLogin(username, password) {
  const { data } = await http.post('/admin/login', { username, password });
  return data; // { token, username }
}

export async function adminVerify() {
  const { data } = await adminHttp.get('/admin/verify');
  return data; // { valid, username }
}

// ─── Admin: Products ──────────────────────────────────────────────────────────

export async function adminFetchProducts() {
  const { data } = await adminHttp.get('/products', { params: { full: 1 } });
  return data;
}

export async function adminCreateProduct(payload) {
  const { data } = await adminHttp.post('/products', payload);
  return data;
}

export async function adminUpdateProduct(id, payload) {
  const { data } = await adminHttp.patch(`/products/${id}`, payload);
  return data;
}

export async function adminDeleteProduct(id) {
  const { data } = await adminHttp.delete(`/products/${id}`);
  return data;
}

// ─── Admin: Announcements ─────────────────────────────────────────────────────

export async function fetchAnnouncements() {
  try {
    const { data } = await http.get('/announcements');
    return data;
  } catch {
    return [];
  }
}

export async function adminFetchAnnouncements() {
  const { data } = await adminHttp.get('/announcements/all');
  return data;
}

export async function adminCreateAnnouncement(payload) {
  const { data } = await adminHttp.post('/announcements', payload);
  return data;
}

export async function adminUpdateAnnouncement(id, payload) {
  const { data } = await adminHttp.patch(`/announcements/${id}`, payload);
  return data;
}

export async function adminDeleteAnnouncement(id) {
  const { data } = await adminHttp.delete(`/announcements/${id}`);
  return data;
}

// ─── Admin: Orders ────────────────────────────────────────────────────────────

export async function adminFetchOrders() {
  const { data } = await adminHttp.get('/orders');
  return data;
}

export async function adminUpdateOrderStatus(id, status) {
  const { data } = await adminHttp.patch(`/orders/${id}`, { status });
  return data;
}

// ─── Admin: Bookings ──────────────────────────────────────────────────────────

export async function adminFetchBookings() {
  const { data } = await adminHttp.get('/bookings');
  return data;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function applyFilters(products, { cat, brand, skill, maxPrice, sort, tags, search, limit } = {}) {
  let r = products.filter(p =>
    (cat      ? cat.split(',').includes(p.cat)     : true) &&
    (brand    ? brand.split(',').includes(p.brand) : true) &&
    (skill    ? skill.split(',').includes(p.skill) : true) &&
    (maxPrice ? p.price <= Number(maxPrice)        : true) &&
    (tags     ? tags.split(',').some(t => (p.tags||[]).includes(t)) : true)
  );
  if (search) r = searchProducts(r, search);
  if (sort === 'low')    r = [...r].sort((a,b) => a.price - b.price);
  else if (sort === 'high')   r = [...r].sort((a,b) => b.price - a.price);
  else if (sort === 'rating') r = [...r].sort((a,b) => b.rating - a.rating);
  else if (!search) r = [...r].sort((a,b) => (b.tags?.length||0) - (a.tags?.length||0));
  if (limit) r = r.slice(0, Number(limit));
  return r;
}
