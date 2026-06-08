import axios from 'axios';
import { PRODUCTS, CATEGORIES } from '../data/data';

const http = axios.create({ baseURL: '/api' });

// Inject the active JWT (user token takes priority over admin token)
http.interceptors.request.use(config => {
  const userToken  = localStorage.getItem('tc_user_token');
  const adminToken = localStorage.getItem('tc_admin_token');
  const token = userToken || adminToken;
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
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
  const { data } = await http.post('/upload', form, {
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

export async function fetchCategories() {
  try {
    const { data } = await http.get('/categories');
    return data;
  } catch {
    return CATEGORIES;
  }
}

export async function adminUpdateCategoryMedia(id, payload) {
  const { data } = await http.patch(`/categories/${id}`, payload);
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

export async function getPayhereHash(order_id, amount, currency = 'LKR') {
  const { data } = await http.post('/payment/payhere-hash', { order_id, amount, currency });
  return data; // { hash, merchant_id, sandbox }
}

// ─── Q&A (legacy admin key path) ─────────────────────────────────────────────

const QA_KEY = import.meta.env.VITE_ADMIN_KEY || '';
const qaHeaders = () => ({ 'x-admin-key': QA_KEY });

export async function fetchPublicQuestions() {
  const { data } = await http.get('/questions');
  return data;
}

export async function submitQuestion(payload) {
  const { data } = await http.post('/questions', payload);
  return data;
}

export async function fetchAllQuestions() {
  const { data } = await http.get('/questions/admin', { headers: qaHeaders() });
  return data;
}

export async function answerQuestion(id, answer, isPublic = true) {
  const { data } = await http.patch(`/questions/${id}/answer`, { answer, public: isPublic }, { headers: qaHeaders() });
  return data;
}

export async function deleteQuestion(id) {
  const { data } = await http.delete(`/questions/${id}`, { headers: qaHeaders() });
  return data;
}

// ─── Admin Auth ───────────────────────────────────────────────────────────────

export async function adminLogin(username, password) {
  const { data } = await http.post('/admin/login', { username, password });
  return data; // { token, username }
}

export async function adminVerify() {
  const { data } = await http.get('/admin/verify');
  return data; // { valid, username }
}

// ─── Admin: Products ──────────────────────────────────────────────────────────

export async function adminFetchProducts() {
  const { data } = await http.get('/products');
  return data;
}

export async function adminCreateProduct(payload) {
  const { data } = await http.post('/products', payload);
  return data;
}

export async function adminUpdateProduct(id, payload) {
  const { data } = await http.patch(`/products/${id}`, payload);
  return data;
}

export async function adminDeleteProduct(id) {
  const { data } = await http.delete(`/products/${id}`);
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
  const { data } = await http.get('/announcements/all');
  return data;
}

export async function adminCreateAnnouncement(payload) {
  const { data } = await http.post('/announcements', payload);
  return data;
}

export async function adminUpdateAnnouncement(id, payload) {
  const { data } = await http.patch(`/announcements/${id}`, payload);
  return data;
}

export async function adminDeleteAnnouncement(id) {
  const { data } = await http.delete(`/announcements/${id}`);
  return data;
}

// ─── Admin: Orders ────────────────────────────────────────────────────────────

export async function adminFetchOrders() {
  const { data } = await http.get('/orders');
  return data;
}

export async function adminUpdateOrderStatus(id, status) {
  const { data } = await http.patch(`/orders/${id}`, { status });
  return data;
}

// ─── Admin: Bookings ──────────────────────────────────────────────────────────

export async function adminFetchBookings() {
  const { data } = await http.get('/bookings');
  return data;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
