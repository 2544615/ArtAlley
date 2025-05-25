/**
 * @jest-environment jsdom
 */

import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

describe('Art Alley Homepage', () => {
  let dom;
  let document;
  let window;

  beforeEach(async () => {
    const htmlPath = path.resolve(__dirname, '../homepage.html');
    const html = fs.readFileSync(htmlPath, 'utf8');

    dom = new JSDOM(html, {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'http://localhost' 
    });

    document = dom.window.document;
    window = dom.window;


    const scriptContent = fs.readFileSync(path.resolve(__dirname, '../homepage.js'), 'utf8');
    const scriptEl = document.createElement('script');
    scriptEl.textContent = scriptContent;
    document.body.appendChild(scriptEl);

    await new Promise(resolve => {
      dom.window.addEventListener('DOMContentLoaded', resolve);
      dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded', { bubbles: true }));
    });


    delete window.location;
    window.location = { href: '' };
  });

  test('Has 3 header icons', () => {
    const icons = document.querySelectorAll('.icons button');
    expect(icons.length).toBe(3);
  });

  test('Form redirects to buyer signup', () => {
    const select = document.querySelector('#roleSelect');
    const form = document.querySelector('#roleForm');

    select.value = '../SignUp Folder/buyer-signup.html';
    const submitEvent = new window.Event('submit', { bubbles: true });
    form.dispatchEvent(submitEvent);

    expect(window.location.href).toBe('../SignUp Folder/buyer-signup.html');
  });

  test('Toggles search bar and focuses input', () => {
    const button = document.querySelector('.fa-search')?.closest('button');
    const searchContainer = document.getElementById('searchContainer');

    expect(searchContainer.classList.contains('hidden')).toBe(true);

    button.click();
    expect(searchContainer.classList.contains('hidden')).toBe(false);
  });

  test('Search saves query and redirects', () => {
    const input = document.getElementById('homeSearchInput');
    const form = document.getElementById('searchForm');

    input.value = 'painting';

    const submitEvent = new window.Event('submit', { bubbles: true });
    form.dispatchEvent(submitEvent);

    expect(window.localStorage.getItem('searchQuery')).toBe('painting');
    expect(window.location.href).toBe('../Buyer Folder/product-listing.html');
  });
});
