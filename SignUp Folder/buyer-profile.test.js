// profile.test.js
import { isValidUsername, isUsernameTaken, saveUserProfile } from './profile';
import { getDocs, query } from 'firebase/firestore';

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  doc: jest.fn(),
}));

describe('Username Validation', () => {
  test('rejects numbers-only username', () => {
    expect(isValidUsername("1234")).toBe(false);
  });

  test('rejects username that is too short', () => {
    expect(isValidUsername("a1")).toBe(false);
  });

  test('rejects username starting with number', () => {
    expect(isValidUsername("1abc")).toBe(false);
  });

  test('accepts valid username', () => {
    expect(isValidUsername("johnDoe123")).toBe(true);
  });
});

describe('Username Uniqueness', () => {
  test('returns true if another user has the username', async () => {
    getDocs.mockResolvedValueOnce({
      docs: [{ id: "anotherUser" }]
    });
    const taken = await isUsernameTaken({}, "johnDoe", "currentUser");
    expect(taken).toBe(true);
  });

  test('returns false if no one else has the username', async () => {
    getDocs.mockResolvedValueOnce({ docs: [] });
    const taken = await isUsernameTaken({}, "johnDoe", "currentUser");
    expect(taken).toBe(false);
  });

  test('returns false if current user is the one with the username', async () => {
    getDocs.mockResolvedValueOnce({ docs: [{ id: "currentUser" }] });
    const taken = await isUsernameTaken({}, "johnDoe", "currentUser");
    expect(taken).toBe(false);
  });
});

describe('Save User Profile', () => {
  test('calls setDoc with correct data', async () => {
    const mockSetDoc = require('firebase/firestore').setDoc;
    const user = { uid: "uid123", email: "test@example.com" };
    const profile = { firstName: "Test", username: "testUser" };

    await saveUserProfile({}, user, profile);
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        uid: "uid123",
        email: "test@example.com",
        role: "buyer",
        firstName: "Test",
        username: "testUser"
      }),
      { merge: true }
    );
  });
});
