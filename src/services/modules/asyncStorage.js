import AsyncStorage from '@react-native-async-storage/async-storage';

const CHUNK_SIZE = 500;

const indexKey = (filename, collection) => `${filename}:${collection}`;
const chunkKey = (filename, collection, index) => `${filename}:${collection}:${index}`;

const toChunks = (value) => {
  const chunks = [];
  for (let index = 0; index < value.length; index += CHUNK_SIZE) chunks.push(value.slice(index, index + CHUNK_SIZE));
  return chunks.length ? chunks : [[]];
};

export class AsyncStorageAdapter {
  constructor({ defaults = {}, filename = 'store' } = {}) {
    // eslint-disable-next-line no-async-promise-executor, no-undef
    return new Promise(async (resolve, reject) => {
      try {
        this.key = filename;
        this.collections = Object.keys(defaults);
        this.defaults = defaults;
        this.written = {};
        this.chunkCount = {};

        await this.migrateFromSingleKey();

        return resolve(this);
      } catch (error) {
        return reject(error);
      }
    });
  }

  async migrateFromSingleKey() {
    const { defaults, key } = this;

    let legacy;
    try {
      legacy = await AsyncStorage.getItem(key);
    } catch (error) {
      throw new Error(`${key} is too large to be read back by this device.`);
    }
    if (!legacy) return;

    let data;
    try {
      data = JSON.parse(legacy);
    } catch (error) {
      throw new Error(`${key} could not be loaded correctly.`);
    }

    await this.write({ ...defaults, ...data });
    await AsyncStorage.removeItem(key);
  }

  async read() {
    const { collections, defaults, key } = this;

    try {
      const indexes = await AsyncStorage.multiGet(collections.map((collection) => indexKey(key, collection)));
      const pending = [];

      const data = collections.reduce((memo, collection, position) => {
        const [, raw] = indexes[position] || [];
        if (raw === null || raw === undefined) {
          memo[collection] = defaults[collection];
          return memo;
        }

        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && Number.isFinite(parsed.__chunks)) {
          pending.push({ collection, chunks: parsed.__chunks, length: parsed.__length });
          this.chunkCount[collection] = parsed.__chunks;
        } else {
          memo[collection] = parsed;
        }
        return memo;
      }, {});

      for (let index = 0; index < pending.length; index += 1) {
        const { chunks, collection, length } = pending[index];
        const keys = Array.from({ length: chunks }, (item, position) => chunkKey(key, collection, position));
        const stored = await AsyncStorage.multiGet(keys);

        data[collection] = stored.reduce((memo, [chunkName, raw]) => {
          if (raw === null || raw === undefined) throw new Error(`${chunkName} is missing`);
          this.written[chunkName] = raw;
          return memo.concat(JSON.parse(raw));
        }, []);

        if (Number.isFinite(length) && data[collection].length !== length) {
          throw new Error(`${indexKey(key, collection)} expected ${length} entries`);
        }
      }

      return data;
    } catch (error) {
      throw new Error(`${key} could not be loaded correctly: ${error.message}`);
    }
  }

  async write(data = {}, collection) {
    const { collections, key } = this;
    const touched = collection && collections.includes(collection) ? [collection] : collections;

    try {
      for (let index = 0; index < touched.length; index += 1) await this.writeCollection(data, touched[index]);
    } catch (error) {
      throw new Error(`${key} could not be saved correctly.`);
    }
  }

  async writeCollection(data, collection) {
    const { key } = this;
    const value = data[collection];

    if (!Array.isArray(value)) {
      const raw = JSON.stringify(value);
      if (this.written[indexKey(key, collection)] === raw) return;
      await AsyncStorage.setItem(indexKey(key, collection), raw);
      this.written[indexKey(key, collection)] = raw;
      return;
    }

    const chunks = toChunks(value);
    const changed = [];
    chunks.forEach((chunk, position) => {
      const name = chunkKey(key, collection, position);
      const raw = JSON.stringify(chunk);
      if (this.written[name] !== raw) changed.push([name, raw]);
    });

    const previous = this.chunkCount[collection] || 0;
    const shrinking = previous > chunks.length;
    const nextIndex = JSON.stringify({ __chunks: chunks.length, __length: value.length });

    if (changed.length) await AsyncStorage.multiSet(changed);
    changed.forEach(([name, raw]) => (this.written[name] = raw));

    await AsyncStorage.setItem(indexKey(key, collection), nextIndex);
    this.chunkCount[collection] = chunks.length;

    if (shrinking) {
      const stale = Array.from({ length: previous - chunks.length }, (item, position) =>
        chunkKey(key, collection, chunks.length + position),
      );
      await AsyncStorage.multiRemove(stale);
      stale.forEach((name) => delete this.written[name]);
    }
  }

  async wipe() {
    const { collections, key } = this;
    const keys = [key];

    collections.forEach((collection) => {
      keys.push(indexKey(key, collection));
      const chunks = this.chunkCount[collection] || 0;
      for (let index = 0; index < chunks; index += 1) keys.push(chunkKey(key, collection, index));
    });

    await AsyncStorage.multiRemove(keys);
    this.written = {};
    this.chunkCount = {};
  }
}
