/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';

// --- Mock window.alert and location.href ---
global.alert = jest.fn();
delete window.location;
window.location = { href: '' };

// --- Mock DOM container ---
document.body.innerHTML = `<div id="ordersContainer"></div>`;

// --- Firebase mocks ---
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  getDocs: jest.fn(),
}));

// Now import the module under test _after_ mocks are in place
import './orders.js';

const {
  getAuth,
} = require('firebase/auth');
const {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} = require('firebase/firestore');

describe('Orders page', () => {
  const mockUser = { uid: 'user123' };
  let authCallback;

  beforeAll(() => {
    // Capture the auth callback so we can invoke it manually
    onAuthStateChanged = require('firebase/auth').onAuthStateChanged;
    authCallback = null;
    onAuthStateChanged.mockImplementation((auth, cb) => {
      authCallback = cb;
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    window.location.href = '';
    document.getElementById('ordersContainer').innerHTML = '';
  });

  test('redirects to login when user is not authenticated', () => {
    // Simulate no user
    authCallback(null);
    expect(alert).toHaveBeenCalledWith('Please log in to view your orders.');
    expect(window.location.href).toBe('../SignIn Folder/login-buyer.html');
  });

  test('displays "no orders" message when snapshot is empty', async () => {
    // Mock getDocs to return empty snapshot
    getDocs.mockResolvedValue({ empty: true });

    authCallback(mockUser);
    // Wait for promise resolution
    await Promise.resolve();

    const container = document.getElementById('ordersContainer');
    expect(container.innerHTML).toContain('You have no orders yet.');
    // verify that query was constructed correctly
    expect(collection).toHaveBeenCalledWith(expect.anything(), 'orders');
    expect(where).toHaveBeenCalledWith('userId', '==', mockUser.uid);
    expect(orderBy).toHaveBeenCalledWith('timestamp', 'desc');
  });

  test('renders order items correctly for a non-empty snapshot', async () => {
    // Create a fake timestamp object
    const fakeDate = new Date('2025-05-21T12:00:00Z');
    const fakeTimestamp = { toDate: () => fakeDate };

    // Mock order documents
    const fakeDocs = [
      {
        id: 'order1',
        data: () => ({
          timestamp: fakeTimestamp,
          items: [
            {
              name: 'Widget',
              quantity: 3,
              price: 25,
              imageUrl: 'http://img.com/w.png',
            },
            {
              name: 'Gadget',
              quantity: 1,
              price: 100,
              // no imageUrl -> should use placeholder
            },
          ],
        }),
      },
    ];

    getDocs.mockResolvedValue({ empty: false, forEach: (fn) => fakeDocs.forEach(fn) });

    authCallback(mockUser);
    // Await microtask to let async code run
    await Promise.resolve();

    const container = document.getElementById('ordersContainer');
    // Check that two .order-item divs were created
    const items = container.querySelectorAll('.order-item');
    expect(items).toHaveLength(2);

    // First item: Widget
    expect(items[0].innerHTML).toContain('Widget');
    expect(items[0].innerHTML).toContain('Qty: 3');
    expect(items[0].querySelector('img').src).toBe('http://img.com/w.png');

    // Second item: Gadget uses placeholder image
    expect(items[1].innerHTML).toContain('Gadget');
    expect(items[1].innerHTML).toContain('Qty: 1');
    expect(items[1].querySelector('img').src).toContain('via.placeholder.com');
  });

  test('shows error message on fetch failure', async () => {
    const error = new Error('Network failure');
    getDocs.mockRejectedValue(error);

    authCallback(mockUser);
    // await promise rejection
    await Promise.resolve();

    const container = document.getElementById('ordersContainer');
    expect(container.innerHTML).toContain('Error loading orders');
    expect(container.innerHTML).toContain('Network failure');
  });
});
