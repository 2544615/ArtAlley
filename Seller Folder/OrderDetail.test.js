/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
}));

// Mock DOM
document.body.innerHTML = `<section id="Orders"></section>`;

const OrdersList = document.getElementById('Orders');

// Load module after setting mocks
beforeEach(() => {
  jest.resetModules();
  OrdersList.innerHTML = '';
});


const flushPromises = () => new Promise(setImmediate);

describe('Seller Orders Page', () => {
  it('redirects to login if user is not authenticated', async () => {
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});
    delete window.location;
    window.location = { href: '' };

    onAuthStateChanged.mockImplementation((auth, callback) => callback(null));

    await import('../sellerOrders.js');
    await flushPromises();

    expect(mockAlert).toHaveBeenCalledWith('Please log in to view your orders.');
    expect(window.location.href).toContain('login-seller.html');
  });

  it('renders seller orders if user is authenticated', async () => {
    const mockUser = { uid: 'seller123' };

    onAuthStateChanged.mockImplementation((auth, callback) => callback(mockUser));

    const mockOrder = {
      items: [
        { sellerId: 'seller123', name: 'Painting', quantity: 2, price: 200, imageUrl: 'url' },
        { sellerId: 'other', name: 'Other', quantity: 1, price: 100 }
      ],
      userId: 'buyer789'
    };

    getDocs.mockImplementationOnce(() => Promise.resolve({
      docs: [{ data: () => mockOrder }]
    }));

    getDocs.mockImplementationOnce(() => Promise.resolve({
      empty: false,
      docs: [{ data: () => ({ firstname: 'John', lastname: 'Doe' }) }]
    }));

    await import('../sellerOrders.js');
    await flushPromises();

    expect(OrdersList.innerHTML).toContain('John Doe');
    expect(OrdersList.innerHTML).toContain('Products bought: 2');
  });

  it('shows message when no seller orders found', async () => {
    const mockUser = { uid: 'seller123' };

    onAuthStateChanged.mockImplementation((auth, callback) => callback(mockUser));
    getDocs.mockImplementation(() => Promise.resolve({
      docs: [{ data: () => ({ items: [], userId: 'buyer000' }) }]
    }));

    await import('../sellerOrders.js');
    await flushPromises();

    expect(OrdersList.innerHTML).toContain('No orders from your store yet.');
  });

  it('handles error during order fetch', async () => {
    const mockUser = { uid: 'seller123' };

    onAuthStateChanged.mockImplementation((auth, callback) => callback(mockUser));
    getDocs.mockImplementation(() => {
      throw new Error('Firestore error');
    });

    await import('../sellerOrders.js');
    await flushPromises();

    expect(OrdersList.innerHTML).toContain('Error loading orders');
  });

  it('saves order to sessionStorage and redirects on click', async () => {
    const mockUser = { uid: 'seller123' };

    const mockOrder = {
      items: [{ sellerId: 'seller123', name: 'Item', quantity: 1, price: 10 }],
      userId: 'buyer123'
    };

    onAuthStateChanged.mockImplementation((auth, callback) => callback(mockUser));
    getDocs.mockImplementationOnce(() => Promise.resolve({
      docs: [{ data: () => mockOrder }]
    }));
    getDocs.mockImplementationOnce(() => Promise.resolve({
      empty: false,
      docs: [{ data: () => ({ firstname: 'Alice', lastname: 'Smith' }) }]
    }));

    delete window.location;
    window.location = { href: '' };
    const sessionSet = jest.spyOn(sessionStorage.__proto__, 'setItem');

    await import('../sellerOrders.js');
    await flushPromises();

    const section = document.querySelector('.order-box');
    section.click();

    await flushPromises();

    expect(sessionSet).toHaveBeenCalledWith('selectedOrder', expect.stringContaining('buyer123'));
    expect(window.location.href).toContain('OrderDetail.html');
  });
});
