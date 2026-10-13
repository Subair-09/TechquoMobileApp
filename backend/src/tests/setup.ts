import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { ENV } from '../config/env.js';

export let testAdminToken: string;
export let testAdminUser: any;

// Clean In-Memory Collection Mock for reliable cross-platform Vitest execution
export class InMemoryCollection {
  public docs: any[] = [];

  constructor(public modelName: string) {}

  clear() {
    this.docs = [];
  }

  createDoc(data: any) {
    const id = data._id ? data._id.toString() : new mongoose.Types.ObjectId().toString();
    const doc: any = {
      ...data,
      _id: id,
      id: id,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    };

    if (this.modelName === 'AdminUser' || this.modelName === 'User') {
      doc.comparePassword = async (pass: string) => {
        return bcrypt.compare(pass, doc.passwordHash);
      };
    }

    doc.save = async () => {
      const idx = this.docs.findIndex((d) => d._id.toString() === id.toString());
      if (idx !== -1) {
        this.docs[idx] = doc;
      } else {
        this.docs.push(doc);
      }
      return doc;
    };

    doc.toObject = () => {
      const { toObject: _o, toJSON: _j, save: _s, comparePassword: _c, ...raw } = doc;
      return { ...raw };
    };
    doc.toJSON = () => {
      const { toObject: _o, toJSON: _j, save: _s, comparePassword: _c, ...raw } = doc;
      return { ...raw };
    };

    return doc;
  }

  async create(data: any) {
    if (Array.isArray(data)) {
      const created = data.map((d) => this.createDoc(d));
      this.docs.push(...created);
      return created;
    }
    const doc = this.createDoc(data);
    this.docs.push(doc);
    return doc;
  }

  private matches(doc: any, filter: any = {}): boolean {
    if (!filter || Object.keys(filter).length === 0) return true;
    for (const [key, val] of Object.entries(filter)) {
      if (key === '$or' && Array.isArray(val)) {
        const matchesOr = val.some((subFilter: any) => this.matches(doc, subFilter));
        if (!matchesOr) return false;
        continue;
      }
      if (key === '$in' || (typeof val === 'object' && val !== null && '$in' in val)) {
        const arr = (val as any).$in;
        if (Array.isArray(arr) && !arr.includes(doc[key])) return false;
        continue;
      }
      if (val instanceof RegExp) {
        if (!val.test(doc[key] || '')) return false;
        continue;
      }
      const docVal = doc[key];
      const targetVal = (val as any)?._id ? (val as any)._id.toString() : val?.toString ? val.toString() : val;
      const currentVal = (docVal as any)?._id ? (docVal as any)._id.toString() : docVal?.toString ? docVal.toString() : docVal;
      if (currentVal !== targetVal) return false;
    }
    return true;
  }

  createQuery(results: any[]) {
    let currentResults = results.map((d) => ({
      ...d,
      toObject: () => ({ ...d }),
      toJSON: () => ({ ...d }),
    }));
    const query: any = {
      populate: (field?: any) => {
        // Mock population for categoryId and authorId
        currentResults = currentResults.map((item) => {
          const itemClone = { ...item };
          if (field === 'categoryId' || (typeof field === 'object' && field.path === 'categoryId')) {
            const cat = categoryStore.docs.find((c) => c._id.toString() === (item.categoryId?.toString() || ''));
            if (cat) itemClone.categoryId = cat;
          }
          if (field === 'authorId' || (typeof field === 'object' && field.path === 'authorId')) {
            const auth = authorStore.docs.find((a) => a._id.toString() === (item.authorId?.toString() || ''));
            if (auth) itemClone.authorId = auth;
          }
          return itemClone;
        });
        return query;
      },
      sort: () => query,
      skip: (n: number) => {
        currentResults = currentResults.slice(n);
        return query;
      },
      limit: (n: number) => {
        currentResults = currentResults.slice(0, n);
        return query;
      },
      select: () => query,
      lean: () => query,
      exec: async () => currentResults,
      then: (resolve: any, reject: any) => {
        return Promise.resolve(currentResults).then(resolve, reject);
      },
    };
    return query;
  }

  async aggregate(pipeline: any[] = []) {
    // Check if pipeline sums views
    const isSumViews = pipeline.some(
      (stage) => stage.$group && (stage.$group.total?.$sum === '$views' || stage.$group.totalViews?.$sum === '$views')
    );
    if (isSumViews) {
      const sum = this.docs.reduce((acc, d) => acc + (d.views || 0), 0);
      return [{ _id: null, total: sum, totalViews: sum }];
    }

    const map = new Map<string, number>();
    for (const doc of this.docs) {
      const catId = doc.categoryId ? doc.categoryId.toString() : '';
      if (catId) {
        map.set(catId, (map.get(catId) || 0) + 1);
      }
    }
    return Array.from(map.entries()).map(([id, total]) => ({ _id: id, total }));
  }

  find(filter: any = {}) {
    const matched = this.docs.filter((d) => this.matches(d, filter));
    return this.createQuery(matched);
  }

  async findOne(filter: any = {}) {
    const doc = this.docs.find((d) => this.matches(d, filter));
    return doc || null;
  }

  async findById(id: any) {
    if (!id) return null;
    const targetId = id?._id ? id._id.toString() : id.toString();
    const doc = this.docs.find((d) => d._id.toString() === targetId);
    return doc || null;
  }

  async findByIdAndUpdate(id: any, update: any, options: any = {}) {
    const targetId = id?._id ? id._id.toString() : id.toString();
    const doc = this.docs.find((d) => d._id.toString() === targetId);
    if (!doc) return null;
    const updateFields = update.$set ? { ...update.$set } : { ...update };
    delete updateFields.$inc;
    Object.assign(doc, updateFields);
    doc.updatedAt = new Date();
    return doc;
  }

  async findByIdAndDelete(id: any) {
    const targetId = id?._id ? id._id.toString() : id.toString();
    const idx = this.docs.findIndex((d) => d._id.toString() === targetId);
    if (idx === -1) return null;
    const [deleted] = this.docs.splice(idx, 1);
    return deleted;
  }

  async countDocuments(filter: any = {}) {
    return this.docs.filter((d) => this.matches(d, filter)).length;
  }

  async updateMany(filter: any = {}, update: any = {}) {
    const updateFields = update.$set ? { ...update.$set } : { ...update };
    let count = 0;
    for (const doc of this.docs) {
      if (this.matches(doc, filter)) {
        Object.assign(doc, updateFields);
        doc.updatedAt = new Date();
        count++;
      }
    }
    return { matchedCount: count, modifiedCount: count };
  }

  async deleteMany(filter: any = {}) {
    if (!filter || Object.keys(filter).length === 0) {
      const count = this.docs.length;
      this.docs = [];
      return { deletedCount: count };
    }
    const initial = this.docs.length;
    this.docs = this.docs.filter((d) => !this.matches(d, filter));
    return { deletedCount: initial - this.docs.length };
  }
}

export const adminUserStore = new InMemoryCollection('AdminUser');
export const categoryStore = new InMemoryCollection('Category');
export const authorStore = new InMemoryCollection('Author');
export const articleStore = new InMemoryCollection('Article');
export const auditLogStore = new InMemoryCollection('AuditLog');
export const articleViewStore = new InMemoryCollection('ArticleView');
export const mediaAssetStore = new InMemoryCollection('MediaAsset');
export const commentStore = new InMemoryCollection('Comment');
export const settingStore = new InMemoryCollection('Setting');
export const userStore = new InMemoryCollection('User');

// Mock mongoose models in Vitest
vi.mock('../models/AdminUser.js', () => ({ AdminUser: adminUserStore }));
vi.mock('../models/Category.js', () => ({ Category: categoryStore }));
vi.mock('../models/Author.js', () => ({ Author: authorStore }));
vi.mock('../models/Article.js', () => ({ Article: articleStore }));
vi.mock('../models/AuditLog.js', () => ({ AuditLog: auditLogStore }));
vi.mock('../models/ArticleView.js', () => ({ ArticleView: articleViewStore }));
vi.mock('../models/MediaAsset.js', () => ({ MediaAsset: mediaAssetStore }));
vi.mock('../models/Comment.js', () => ({ Comment: commentStore }));
vi.mock('../models/Setting.js', () => ({ Setting: settingStore }));
vi.mock('../models/User.js', () => ({ User: userStore }));
vi.mock('../middleware/auditLogger.js', () => ({ logAudit: vi.fn() }));

beforeAll(async () => {
  // Create default test super admin in memory
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('TestAdminPass123!', salt);

  testAdminUser = await adminUserStore.create({
    name: 'Test Super Admin',
    email: 'testadmin@techquo.news',
    passwordHash,
    role: 'super_admin',
    isActive: true,
  });

  testAdminToken = jwt.sign(
    { id: testAdminUser._id, email: testAdminUser.email, role: testAdminUser.role },
    ENV.JWT_SECRET,
    { expiresIn: '1h' }
  );
});

afterAll(async () => {
  // cleanup
});

beforeEach(async () => {
  // Clear collections except AdminUser
  categoryStore.clear();
  authorStore.clear();
  articleStore.clear();
  auditLogStore.clear();
  articleViewStore.clear();
  mediaAssetStore.clear();
  commentStore.clear();
  settingStore.clear();
});
