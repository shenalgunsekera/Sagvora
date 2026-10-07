// In-memory Firestore stand-in so the real InsureSAAS UI can be rendered with
// demo data for screenshots. Implements only the surface the app imports.
import { SEED } from './seed.js';
import { Timestamp } from './timestamp.js';

const store = new Map(); // path -> Map(id -> data)
const listeners = new Set();
for (const [col, docs] of Object.entries(SEED)) {
  const m = new Map();
  for (const d of docs) { const { id, ...rest } = d; m.set(id, rest); }
  store.set(col, m);
}
const colMap = (p) => { if (!store.has(p)) store.set(p, new Map()); return store.get(p); };
let autoId = 1000;

export { Timestamp };

const S = (kind, v) => ({ __sentinel: kind, v });
export const serverTimestamp = () => Timestamp.now();
export const arrayUnion = (...v) => S('union', v);
export const arrayRemove = (...v) => S('remove', v);
export const increment = (n) => S('inc', n);
export const deleteField = () => S('delete');
export const documentId = () => '__id__';

export const getFirestore = () => ({ type: 'firestore' });
export const initializeFirestore = getFirestore;
export const enableIndexedDbPersistence = () => Promise.resolve();
export const enableMultiTabIndexedDbPersistence = () => Promise.resolve();
export const persistentLocalCache = () => ({});
export const persistentMultipleTabManager = () => ({});

export function collection(_db, ...segs) {
  const base = _db && _db.type === 'doc' ? _db.path + '/' : '';
  return { type: 'collection', path: base + segs.join('/') };
}
export function doc(parent, ...segs) {
  let path;
  if (parent.type === 'collection') path = parent.path + '/' + (segs[0] || 'auto' + autoId++);
  else path = segs.join('/');
  const i = path.lastIndexOf('/');
  return { type: 'doc', path, id: path.slice(i + 1), parent: { path: path.slice(0, i) } };
}
export const where = (field, op, value) => ({ kind: 'where', field, op, value });
export const orderBy = (field, dir = 'asc') => ({ kind: 'orderBy', field, dir });
export const limit = (n) => ({ kind: 'limit', n });
export const startAfter = () => ({ kind: 'noop' });
export const query = (ref, ...cs) => ({ type: 'query', path: ref.path, constraints: [...(ref.constraints || []), ...cs] });

const cmpVal = (v) => (v && v.seconds !== undefined ? v.seconds : v);
function matches(data, w) {
  const a = data[w.field];
  const b = w.value;
  switch (w.op) {
    case '==': return (a ?? null) === b || cmpVal(a) === cmpVal(b);
    case '!=': return a !== b;
    case '<': return cmpVal(a) < cmpVal(b);
    case '<=': return cmpVal(a) <= cmpVal(b);
    case '>': return cmpVal(a) > cmpVal(b);
    case '>=': return cmpVal(a) >= cmpVal(b);
    case 'in': return b.includes(a);
    case 'not-in': return !b.includes(a);
    case 'array-contains': return Array.isArray(a) && a.includes(b);
    case 'array-contains-any': return Array.isArray(a) && a.some((x) => b.includes(x));
    default: return true;
  }
}

function docSnap(path, data) {
  const i = path.lastIndexOf('/');
  const id = path.slice(i + 1);
  const ref = doc({ type: 'x' }, path);
  return {
    id, ref,
    exists: () => data !== undefined,
    data: () => (data === undefined ? undefined : structuredCloneSafe(data)),
    get: (f) => data?.[f],
    metadata: { fromCache: false, hasPendingWrites: false },
  };
}
function structuredCloneSafe(o) {
  // Keep Timestamp instances intact.
  if (o === null || typeof o !== 'object') return o;
  if (o instanceof Timestamp) return o;
  if (Array.isArray(o)) return o.map(structuredCloneSafe);
  const r = {};
  for (const k in o) r[k] = structuredCloneSafe(o[k]);
  return r;
}

function runQuery(q) {
  let rows = [...colMap(q.path).entries()];
  for (const c of q.constraints || []) {
    if (c.kind === 'where') rows = rows.filter(([, d]) => matches(d, c));
  }
  const ob = (q.constraints || []).filter((c) => c.kind === 'orderBy');
  for (const o of ob.reverse()) {
    rows.sort(([, a], [, b]) => {
      const x = cmpVal(a[o.field]), y = cmpVal(b[o.field]);
      const r = x > y ? 1 : x < y ? -1 : 0;
      return o.dir === 'desc' ? -r : r;
    });
  }
  const lim = (q.constraints || []).find((c) => c.kind === 'limit');
  if (lim) rows = rows.slice(0, lim.n);
  const docs = rows.map(([id, d]) => docSnap(q.path + '/' + id, d));
  return {
    docs, size: docs.length, empty: docs.length === 0,
    forEach: (fn) => docs.forEach(fn),
    docChanges: () => docs.map((d) => ({ type: 'added', doc: d })),
    metadata: { fromCache: false, hasPendingWrites: false },
  };
}

const tick = () => new Promise((r) => setTimeout(r, 5));
const readDoc = (ref) => colMap(ref.parent.path).get(ref.id);

export async function getDoc(ref) { await tick(); return docSnap(ref.path, readDoc(ref)); }
export const getDocFromServer = getDoc;
export const getDocFromCache = getDoc;
export async function getDocs(q) { await tick(); return runQuery(q.type === 'collection' ? { ...q, constraints: [] } : q); }
export const getDocsFromServer = getDocs;
export async function getCountFromServer(q) { const s = await getDocs(q); return { data: () => ({ count: s.size }) }; }

function applyPatch(prev, patch) {
  const next = { ...(prev || {}) };
  for (const [k, v] of Object.entries(patch)) {
    if (v && v.__sentinel) {
      if (v.__sentinel === 'union') next[k] = [...new Set([...(next[k] || []), ...v.v])];
      else if (v.__sentinel === 'remove') next[k] = (next[k] || []).filter((x) => !v.v.includes(x));
      else if (v.__sentinel === 'inc') next[k] = (next[k] || 0) + v.v;
      else if (v.__sentinel === 'delete') delete next[k];
    } else if (k.includes('.')) {
      const [a, ...rest] = k.split('.');
      next[a] = applyPatch(next[a], { [rest.join('.')]: v });
    } else next[k] = v;
  }
  return next;
}
function write(ref, data, merge) {
  const m = colMap(ref.parent.path);
  m.set(ref.id, merge ? applyPatch(m.get(ref.id), data) : applyPatch({}, data));
  notify();
}
export async function setDoc(ref, data, opts) { write(ref, data, opts?.merge); }
export async function updateDoc(ref, data) { write(ref, data, true); }
export async function addDoc(col, data) { const ref = doc(col); write(ref, data, false); return ref; }
export async function deleteDoc(ref) { colMap(ref.parent.path).delete(ref.id); notify(); }
export function writeBatch() {
  const ops = [];
  return {
    set: (r, d, o) => { ops.push(() => write(r, d, o?.merge)); },
    update: (r, d) => { ops.push(() => write(r, d, true)); },
    delete: (r) => { ops.push(() => colMap(r.parent.path).delete(r.id)); },
    commit: async () => { ops.forEach((f) => f()); notify(); },
  };
}
export async function runTransaction(_db, fn) {
  return fn({ get: getDoc, set: (r, d, o) => write(r, d, o?.merge), update: (r, d) => write(r, d, true), delete: (r) => deleteDoc(r) });
}

function notify() { for (const l of listeners) setTimeout(l, 0); }
export function onSnapshot(ref, ...args) {
  const fns = args.filter((a) => typeof a === 'function');
  const obs = args.find((a) => a && typeof a === 'object' && (a.next || a.error));
  const next = fns[0] || obs?.next;
  const emit = () => {
    if (!next) return;
    if (ref.type === 'doc') next(docSnap(ref.path, readDoc(ref)));
    else next(runQuery(ref.type === 'collection' ? { ...ref, constraints: [] } : ref));
  };
  setTimeout(emit, 5);
  listeners.add(emit);
  return () => listeners.delete(emit);
}
