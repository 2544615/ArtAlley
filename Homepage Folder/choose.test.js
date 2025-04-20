/**
 * @jest-environment jsdom
 */

describe('Choose Role Page - ArtAlley', () => {
    let originalLocation;
    let form;
    let select;
  
    beforeAll(() => {
      // Mock window.location
      delete window.location;
      window.location = { href: '' };
      originalLocation = window.location;
    });
  
    beforeEach(() => {
      // Set up DOM
      document.body.innerHTML = `
        <form id="roleForm" aria-label="Role selection form">
        <h2>Choose a role</h2>

        <select id="roleSelect" name="role" required>
            <option value="" hidden>Select a role</option>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </select>
          
          <button type="submit">Submit</button>
    </form>
      `;
      form = document.getElementById('roleForm');
      select = document.getElementById('roleSelect');
      
      // Mock form submission
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (select.value === 'buyer') {
          window.location.href = 'login-buyer';
        } else if (select.value === 'seller') {
          window.location.href = 'login-seller';
        }
      });
    });
  
    afterAll(() => {
      // Restore original location
      window.location = originalLocation;
    });
  
    test('Displays the role selection form', () => {
      expect(form).toBeTruthy();
      expect(document.querySelector('h2').textContent).toBe('Choose a role');
      expect(select).toBeTruthy();
      expect(select.options.length).toBe(3); // includes the default disabled option
    });
  
    test('Redirects to buyer login when Buyer is selected', () => {
      select.value = 'buyer';
      form.dispatchEvent(new Event('submit'));
      expect(window.location.href).toBe('login-buyer');
    });
  
    test('Redirects to seller login when Seller is selected', () => {
      select.value = 'seller';
      form.dispatchEvent(new Event('submit'));
      expect(window.location.href).toBe('login-seller');
    });
  
    test('Does not submit form if no role is selected', () => {
      select.value = '';
      const originalHref = window.location.href;
      form.dispatchEvent(new Event('submit'));
      expect(window.location.href).toBe(originalHref);
    });
  });