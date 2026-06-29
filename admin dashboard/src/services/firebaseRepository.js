export function createCollectionRepository(collectionName) {
  return {
    collectionName,
    async list() {
      throw new Error(`Connect Firestore adapter for ${collectionName}.`);
    },
    async create() {
      throw new Error(`Connect Firestore adapter for ${collectionName}.`);
    },
    async update() {
      throw new Error(`Connect Firestore adapter for ${collectionName}.`);
    },
    async remove() {
      throw new Error(`Connect Firestore adapter for ${collectionName}.`);
    },
  };
}
