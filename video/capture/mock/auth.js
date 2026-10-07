// Auth stand-in: signed-in state lives in sessionStorage so Playwright can
// capture the login screen first and then the authenticated app.
const KEY = 'mock_user';
const USER = {
  uid: 'demo-admin',
  email: 'nadeesha@insuresaas.lk',
  displayName: 'Nadeesha Perera',
  isAnonymous: false,
  getIdToken: async () => 'demo',
};
const auth = { currentUser: null, _subs: new Set() };
try { if (sessionStorage.getItem(KEY)) auth.currentUser = USER; } catch (_) {}

const emit = () => auth._subs.forEach((cb) => cb(auth.currentUser));

export const getAuth = () => auth;
export const initializeAuth = () => auth;
export const browserSessionPersistence = 'session';
export const browserLocalPersistence = 'local';
export const inMemoryPersistence = 'memory';
export const setPersistence = async () => {};
export function onAuthStateChanged(_a, cb) {
  auth._subs.add(cb);
  setTimeout(() => cb(auth.currentUser), 10);
  return () => auth._subs.delete(cb);
}
export const onIdTokenChanged = onAuthStateChanged;
export async function signInWithEmailAndPassword() {
  auth.currentUser = USER;
  try { sessionStorage.setItem(KEY, '1'); } catch (_) {}
  emit();
  return { user: USER };
}
export async function signInAnonymously() { return { user: { uid: 'anon', isAnonymous: true } }; }
export async function signOut() {
  auth.currentUser = null;
  try { sessionStorage.removeItem(KEY); } catch (_) {}
  emit();
}
export async function createUserWithEmailAndPassword(_a, email) { return { user: { uid: 'u' + Date.now(), email } }; }
export async function updateProfile() {}
export async function sendPasswordResetEmail() {}
export async function updatePassword() {}
export async function reauthenticateWithCredential() {}
export const EmailAuthProvider = { credential: () => ({}) };
