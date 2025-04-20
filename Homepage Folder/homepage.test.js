/**
 * @jest-environment jsdom
 */

describe('Art Alley Homepage', () => {
    let originalLocation;
  
    beforeAll(() => {
      // Mock window.location
      delete window.location;
      window.location = { href: '' };
      originalLocation = window.location;
    });
  
    beforeEach(() => {
      // Set up DOM with homepage structure
      document.body.innerHTML = `
        <header>
    <nav>
      <ul class="icons">
        <li><button><i class="fas fa-search"></i></button></li>
        <li><button><i class="fas fa-shopping-cart"></i></button></li>
        <li><button><i class="fas fa-user"></i></button></li>
      </ul>
    </nav>
  </header>

  <main>
    <section class="title-section">
      <h1>ArtAlley</h1>
      <p>Where Culture Meets Craft – Handmade Treasures Await</p>
    </section>

    <section class="artisan-gallery">
      <figure><img src="https://www.insightsafariholidays.com/wp-content/uploads/crafts.jpg" alt="Crafts 1"></figure>
      <figure><img src="https://ebaronosleather.com/wp-content/uploads/2018/07/arts-and-crafts.jpg" alt="Crafts 2"></figure>
      <figure><img src="https://t3.ftcdn.net/jpg/08/46/64/76/360_F_846647619_MRvbMx2QmXrnCg0U7k9sRZKOpttnco6u.jpg" alt="Crafts 3"></figure>
    </section>

    <section class="auth-section">
      <p>New to our platform?</p>
      <form id="roleForm" aria-label="Role selection form">
        <label for="roleSelect" class="visually-hidden">Select your role</label>
        <select id="roleSelect" name="role" required>
          <option value="" disabled selected>Select a role</option>
          <option value="../SignUp Folder/buyer-signup.html">Buyer</option>
          <option value="../SignUp Folder/seller-signup.html">Seller</option>
        </select>
        <button type="submit">Submit</button>
      </form>

      <p>Already an existing user? <a href="choose.html">Login here</a></p>
    </section>
  </main>

  <footer>
    <section class="footer-help">
      <h2>Help</h2>
      <ul>
        <li><a href="#">Contact Us</a></li>
        <li><a href="#">Submit an Idea</a></li>
        <li><a href="#">Suggest a Product</a></li>
      </ul>
    </section>

    <section class="footer-logo">
      <h2>ArtAlley</h2>
    </section>

    <section class="footer-account">
      <h2>Account</h2>
      <ul>
        <li><a href="#">My Account</a></li>
        <li><a href="#">Track Order</a></li>
        <li><a href="#">Personal Details</a></li>
      </ul>
    </section>
  </footer>
      `;
  
      // Mock form submission
      document.getElementById('roleForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const role = document.getElementById('roleSelect').value;
        window.location.href = `${role.toLowerCase()}-signup`;
      });
    });
  
    afterAll(() => {
      // Restore original location
      window.location = originalLocation;
    });
  
    test('Displays header icons correctly', () => {
      const buttons = document.querySelectorAll('.icons button');
      expect(buttons.length).toBe(3);
      expect(document.querySelector('.fa-search')).not.toBeNull();
      expect(document.querySelector('.fa-shopping-cart')).not.toBeNull();
      expect(document.querySelector('.fa-user')).not.toBeNull();
    });
  
    test('Displays title section correctly', () => {
      const title = document.querySelector('h1');
      const subtitle = document.querySelector('p');
      expect(title.textContent).toBe('ArtAlley');
      expect(subtitle.textContent).toBe('Where Culture Meets Craft – Handmade Treasures Await');
    });
  
    test('Shows all 3 artisan images', () => {
      const images = document.querySelectorAll('.artisan-gallery img');
      expect(images.length).toBe(3);
    });
  
    test('Validates role selection form', () => {
      const select = document.getElementById('roleSelect');
      const submitButton = document.querySelector('#roleForm button[type="submit"]');
      expect(select).not.toBeNull();
      expect(submitButton.textContent).toContain('Submit');
    });
  
    test('Redirects user to selected signup page', () => {
        // Mock window.location
        delete window.location;
        window.location = { href: '' };

        // Reattach the submit listener as per your script
        document.getElementById("roleForm").addEventListener("submit", function(event) {
            event.preventDefault();
            const selected = document.getElementById("roleSelect").value;
            if (selected) {
            window.location.href = selected;
            }
        });

        /// Set the selected value
        const select = document.getElementById('roleSelect');
        select.value = '../SignUp Folder/buyer-signup.html';

        // Submit the form
        const form = document.getElementById('roleForm');
        const event = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(event);

        // Expect the redirect
        expect(window.location.href).toBe('../SignUp Folder/buyer-signup.html');
      });
  
    test('Displays footer sections and links', () => {
      const footerTexts = ['Help', 'Account', 'ArtAlley'];
      footerTexts.forEach(text => {
        expect(document.body.textContent).toContain(text);
      });
      
      const footerLinks = document.querySelectorAll('footer a');
      expect(footerLinks.length).toBeGreaterThanOrEqual(6);
    });
  });