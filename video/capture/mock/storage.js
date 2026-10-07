export const getStorage = () => ({});
export const ref = (_s, path) => ({ fullPath: path });
export const getDownloadURL = async () => '#';
export const deleteObject = async () => {};
export function uploadBytesResumable() {
  return { on: (_e, _p, _err, done) => setTimeout(done, 10), snapshot: { ref: {} } };
}
export const uploadBytes = async () => ({ ref: {} });
