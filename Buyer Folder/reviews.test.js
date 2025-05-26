/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';
import { setDoc, getDocs, doc, collection, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Mocks
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
  doc: jest.fn(),
  setDoc: jest.fn(),
}));

// Sample DOM setup
document.body.innerHTML = `
  <select id="reviewFilter"></select>
  <section id="productsList"></section>
  <section id="reviewModal" style="display:none"></section>
  <button class="close"></button>
  <button id="submitReview"></button>
  <img id="modalProductImage"/>
  <section id="modalProductName"></section>
  <textarea id="reviewText"></textarea>
  <section class="star" data-value="1">☆</section>
  <section class="star" data-value="2">☆</section>
  <section class="star" data-value="3">☆</section>
  <section class="star" data-value="4">☆</section>
  <section class="star" data-value="5">☆</section>
`;

// Import your original script (adapted to export functions)
import * as script from './your-script-file.js'; // Rename to your actual file

describe('Review system', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    script.currentUser = { uid: 'test-user' };
  });

  test('should submit a review successfully', async () => {
    script.currentProduct = {
      name: 'Test Product',
      imageUrl: 'http://image.com/product.jpg',
    };

    script.selectedRating = 4;
    document.getElementById('reviewText').value = 'Great product!';

    await script.submitReview();

    expect(setDoc).toHaveBeenCalled();
  });

  test('should alert if rating is not selected', async () => {
    script.selectedRating = 0;
    document.getElementById('reviewText').value = 'Nice';

    global.alert = jest.fn();

    await script.submitReview();

    expect(alert).toHaveBeenCalledWith('Please select a rating');
    expect(setDoc).not.toHaveBeenCalled();
  });

  test('should alert if review text is empty', async () => {
    script.selectedRating = 5;
    document.getElementById('reviewText').value = '   ';

    global.alert = jest.fn();

    await script.submitReview();

    expect(alert).toHaveBeenCalledWith('Please write your review');
    expect(setDoc).not.toHaveBeenCalled();
  });

  test('getReviewedProducts returns product names', async () => {
    const mockDocs = [
      { data: () => ({ productName: 'Art Poster' }) },
      { data: () => ({ productName: 'Abstract Painting' }) },
    ];

    getDocs.mockResolvedValue({ docs: mockDocs });

    const reviewed = await script.getReviewedProducts();

    expect(reviewed).toEqual(['Art Poster', 'Abstract Painting']);
  });

  test('setRating updates stars', () => {
    const starElems = document.querySelectorAll('.star');
    const secondStar = starElems[1]; // 2nd star (value = 2)

    script.setRating(secondStar);

    expect(script.selectedRating).toBe(2);
    expect(starElems[0].textContent).toBe('★');
    expect(starElems[1].textContent).toBe('★');
    expect(starElems[2].textContent).toBe('☆');
  });
});
