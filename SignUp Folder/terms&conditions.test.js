/**
 * @jest-environment jsdom
 */


describe('Terms and Conditions Page', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <h2>Terms and conditions</h2>
        <p>Welcome to ArtAlley. By accessing or using our Website, you agree to comply with and be bound by these Terms and Conditions. If you do not agree with these terms, please refrain from using the Website.</p>
  
        <h3>License</h3>
        <p>
            You are granted a non-exclusive, non-transferable license to access and use the Website for personal or business purposes. Use of the Website for any unlawful purpose or in a manner that could damage, disable, or impair its functionality is strictly prohibited.
        </p>
  
        <h3>Account Responsibility</h3>
        <p>
            To access certain features of the Website, you may need to create an account. You are responsible for maintaining the confidentiality of your account information and all activities performed under your account. Notify us immediately if you suspect unauthorized use of your account.
        </p>
  
        <h3>Privacy Policy</h3>
        <p>
            Your use of the Website is governed by our Privacy Policy, which outlines how we collect, use, and protect your personal information. Please review our Privacy Policy to understand our practices.
        </p>
  
        <h3>Content Submission</h3>
        <p>
            By submitting any content (including text, images, videos, etc.) to the Website, you grant <strong>ArtAlley</strong> a worldwide, royalty-free, and non-exclusive license to use, display, and distribute that content in connection with the Website. While you retain ownership of your content, you agree to adhere to the following guidelines:
        </p>
        <ul>
            <li>Content must not violate intellectual property rights.</li>
            <li>Content must not be defamatory, obscene, offensive, or infringe on privacy rights.</li>
            <li>Content must not violate applicable laws or regulations.</li>
        </ul>
  
        <h3>Intellectual Property</h3>
        <p>
            All content on the Website—including text, images, graphics, logos, and trademarks—is the property of <strong>ArtAlley</strong> or its licensors and is protected by copyright and intellectual property laws. Reproducing, modifying, or distributing content from the Website without permission is prohibited.
        </p>
  
        <h3>Third-Party Links</h3>
        <p>
            The Website may contain links to third-party websites or services not owned or controlled by <strong>ArtAlley</strong>. We are not responsible for their content, privacy policies, or practices. <strong>ArtAlley</strong> will not be liable for any damages or losses resulting from the use of these third-party sites.
        </p>
  
        <h3>Disclaimer</h3>
        <p>
            The Website is provided "as is" and "as available." <strong>ArtAlley</strong> makes no guarantees regarding the accuracy, reliability, or uninterrupted operation of its content or services. We do not guarantee that the Website will be free from errors, bugs, or interruptions.
        </p>
  
        <h3>Limitation of Liability</h3>
        <p>
            To the fullest extent permitted by law, <strong>ArtAlley</strong> shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Website, including loss of data, profits, or business opportunities.
        </p>
  
        <h3>Termination</h3>
        <p>
            We reserve the right to suspend or terminate your access to the Website at any time, without notice, if you violate these Terms and Conditions.
        </p>
      `;
    });
  
    test('displays the Terms and Conditions heading', () => {
      const heading = document.querySelector('h2');
      expect(heading).not.toBeNull();
      expect(heading.textContent.toLowerCase()).toContain('terms and conditions');
    });
  
    
  });
  