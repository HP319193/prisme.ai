const ids = new Set();
export function generateId() {
  let newId;
  while (!newId || ids.has(newId)) {
    newId = `${Math.random()}`.replace('.', '');
  }

  return newId;
}

export default generateId;
