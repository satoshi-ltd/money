/* eslint-disable no-async-promise-executor */
import { AsyncStorageAdapter } from './modules';

// eslint-disable-next-line no-undef
const state = new WeakMap();

const matches = (row, query) => Object.keys(query).every((field) => row[field] === query[field]);

class Collection {
  constructor(record, key) {
    this.record = record;
    this.key = key;
  }

  get value() {
    return this.record.data[this.key];
  }

  findOne(query = {}) {
    return this.value.find((row) => matches(row, query));
  }

  find(query = {}) {
    const values = this.value.filter((row) => matches(row, query));

    return values.length > 0 ? values : undefined;
  }

  async save(value) {
    if (!value) return undefined;

    const { adapter, data } = this.record;
    const current = data[this.key];
    const isArray = current === undefined || Array.isArray(current);

    if (isArray) {
      const next = Array.isArray(value) ? value : [value];
      data[this.key] = current ? [...current, ...next] : next;
    } else {
      data[this.key] = { ...current, ...value };
    }

    await adapter.write(data, this.key);

    return value;
  }

  async update(query, nextData) {
    const { adapter, data } = this.record;
    const values = [];

    data[this.key] = this.value.map((row) => {
      if (!matches(row, query)) return row;
      const changes = { ...row, ...nextData };
      values.push(changes);
      return changes;
    });

    if (values.length > 0) await adapter.write(data, this.key);

    return values;
  }

  async remove(query) {
    const { adapter, data } = this.record;
    const values = this.value.filter((row) => matches(row, query));

    if (values.length > 0) {
      data[this.key] = this.value.filter((row) => !values.includes(row));
      await adapter.write(data, this.key);
    }

    return values;
  }
}

export class StorageService {
  constructor({ adapter: Adapter = AsyncStorageAdapter, defaults = {}, filename = 'store' } = {}) {
    // eslint-disable-next-line no-undef
    return new Promise(async (resolve, reject) => {
      try {
        const adapter = await new Adapter({ defaults, filename });

        state.set(this, {
          adapter,
          data: await adapter.read(),
          defaults: JSON.parse(JSON.stringify(defaults)),
          filename,
        });

        resolve(this);
      } catch (error) {
        reject(error);
      }
    });
  }

  get(key) {
    return new Collection(state.get(this), key);
  }

  async wipe(key) {
    const { adapter, data, defaults } = state.get(this);

    if (key) {
      data[key] = JSON.parse(JSON.stringify(defaults[key]));
      await adapter.write(data, key);
      return;
    }

    Object.keys(defaults).forEach((collection) => {
      data[collection] = JSON.parse(JSON.stringify(defaults[collection]));
    });

    await adapter.wipe();
    await adapter.write(data);
  }
}
