// test.js
import { isValidUsername, isUsernameUnique, updateUsername } from './usernameUtils';
import { getDocs, setDoc, updateDoc, doc, collection, query, where } from 'firebase/firestore';

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn()
}));

describe("Username Validation", () => {
  test("rejects numbers only", () => {
    expect(isValidUsername("1234")).toBe(false);
  });

  test("rejects short usernames", () => {
    expect(isValidUsername("a1")).toBe(false);
  });

  test("rejects usernames starting with number", () => {
    expect(isValidUsername("1abc")).toBe(false);
  });

  test("accepts valid username", () => {
    expect(isValidUsername("John123")).toBe(true);
  });
});

describe("Username Uniqueness", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns false if another user has same username", async () => {
    getDocs.mockResolvedValueOnce({
      docs: [{ id: "someOtherUser" }]
    });

    const result = await isUsernameUnique({}, "John123", "currentUser");
    expect(result).toBe(false);
  });

  test("returns true if username is used only by current user", async () => {
    getDocs.mockResolvedValueOnce({
      docs: [{ id: "currentUser" }]
    });

    const result = await isUsernameUnique({}, "John123", "currentUser");
    expect(result).toBe(true);
  });

  test("returns true if no one uses the username", async () => {
    getDocs.mockResolvedValueOnce({ docs: [] });

    const result = await isUsernameUnique({}, "John123", "currentUser");
    expect(result).toBe(true);
  });
});

describe("Username Update", () => {
  test("calls updateDoc with correct data", async () => {
    const mockUpdate = updateDoc;
    const uid = "uid123";
    const username = "NewName";

    await updateUsername({}, uid, username);

    expect(doc).toHaveBeenCalledWith({}, "users", uid);
    expect(mockUpdate).toHaveBeenCalledWith(expect.anything(), { username: "NewName" });
  });
});
