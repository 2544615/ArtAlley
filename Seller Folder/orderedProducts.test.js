/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';

jest.mock('firebase/app', () => ({ initializeApp: jest.fn() }));
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  addDoc: jest.fn(),
  serverTimestamp: jest.fn(),
}));
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));
jest.mock('axios');

import { onAuthStateChanged } from 'firebase/auth';
import { addDoc } from 'firebase/firestore';
import axios from 'axios';

const flushPromises = () => new Promise(setImmediate);

describe('Product Upload Form', () => {
  let form, imageInput, previewContainer, mainImageText, mainImageIndexInput;

  beforeEach(() => {
    document.body.innerHTML = `
      <form id="product-form">
        <input id="productName" value="Test Product" />
        <input id="price" value="99.99" />
        <input id="quantity" value="5" />
        <textarea id="description">Nice product</textarea>
        <input type="file" id="image" multiple />
        <input id="mainImageIndex" />
        <div id="preview-images"></div>
        <p id="select-main-text" style="display: none;">Select main image</p>
      </form>
    `;

    form = document.getElementById('product-form');
    imageInput = document.getElementById('image');
    previewContainer = document.getElementById('preview-images');
    mainImageText = document.getElementById('select-main-text');
    mainImageIndexInput = document.getElementById('mainImageIndex');

    // Reset mocks before each test
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('redirects to login if user not logged in', async () => {
    delete window.location;
    window.location = { href: '' };
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    onAuthStateChanged.mockImplementation((auth, cb) => cb(null));
    await import('../productUpload.js');
    expect(alertMock).toHaveBeenCalledWith('Please log in first.');
    expect(window.location.href).toContain('login-seller.html');
  });

  it('previews and selects main image correctly', async () => {
    const blob = new Blob([''], { type: 'image/png' });
    const file1 = new File([blob], 'image1.png', { type: 'image/png' });
    const file2 = new File([blob], 'image2.png', { type: 'image/png' });

    Object.defineProperty(imageInput, 'files', {
      value: [file1, file2],
    });

    await import('../productUpload.js');
    imageInput.dispatchEvent(new Event('change'));

    expect(previewContainer.children.length).toBe(2);
    previewContainer.children[1].click();
    expect(mainImageIndexInput.value).toBe('1');
    expect(previewContainer.children[1].style.border).toContain('green');
  });

  it('uploads images to Cloudinary and submits product', async () => {
    const user = { uid: 'seller123' };
    const blob = new Blob([''], { type: 'image/png' });
    const file = new File([blob], 'test.png', { type: 'image/png' });

    Object.defineProperty(imageInput, 'files', { value: [file] });
    mainImageIndexInput.value = '0';

    onAuthStateChanged.mockImplementation((auth, cb) => cb(user));
    axios.post.mockResolvedValueOnce({
      data: { secure_url: 'https://cloudinary.com/test-image.png' },
    });
    addDoc.mockResolvedValueOnce();

    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    delete window.location;
    window.location = { href: '' };

    await import('../productUpload.js');
    imageInput.dispatchEvent(new Event('change'));
    previewContainer.children[0]?.click(); // simulate image selection
    form.dispatchEvent(new Event('submit'));

    await flushPromises();

    expect(axios.post).toHaveBeenCalled();
    expect(addDoc).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      name: 'Test Product',
      price: 99.99,
      quantity: 5,
      description: 'Nice product',
      imageUrls: ['https://cloudinary.com/test-image.png'],
      mainImageUrl: 'https://cloudinary.com/test-image.png',
      sellerUID: user.uid,
    }));
    expect(alertMock).toHaveBeenCalledWith('Product added successfully!');
    expect(window.location.href).toContain('seller-dashboard.html');
  });

  it('handles missing images and alerts user', async () => {
    onAuthStateChanged.mockImplementation((auth, cb) => cb({ uid: 'seller' }));
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    await import('../productUpload.js');

    form.dispatchEvent(new Event('submit'));
    await flushPromises();

    expect(alertMock).toHaveBeenCalledWith('Please select an image.');
  });

  it('handles no main image selected', async () => {
    const file = new File([''], 'image.png', { type: 'image/png' });
    Object.defineProperty(imageInput, 'files', {
      value: [file],
    });

    onAuthStateChanged.mockImplementation((auth, cb) => cb({ uid: 'seller' }));
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    await import('../productUpload.js');
    imageInput.dispatchEvent(new Event('change'));
    form.dispatchEvent(new Event('submit'));

    await flushPromises();
    expect(alertMock).toHaveBeenCalledWith('Please select a main image.');
  });

  it('shows error when Cloudinary upload fails', async () => {
    const file = new File([''], 'bad.png', { type: 'image/png' });
    Object.defineProperty(imageInput, 'files', {
      value: [file],
    });
    mainImageIndexInput.value = '0';

    onAuthStateChanged.mockImplementation((auth, cb) => cb({ uid: 'seller' }));
    axios.post.mockRejectedValueOnce(new Error('Upload failed'));
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    await import('../productUpload.js');
    imageInput.dispatchEvent(new Event('change'));
    previewContainer.children[0]?.click();
    form.dispatchEvent(new Event('submit'));

    await flushPromises();
    expect(alertMock).toHaveBeenCalledWith('Image upload failed.');
  });
});
