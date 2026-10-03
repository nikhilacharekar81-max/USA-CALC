import { Category, Subcategory, Calculator, SiteSettings, BlogPost } from '../types/schema.ts';

const ADMIN_TOKEN_KEY = 'calcplatform_admin_token';

export const getAdminToken = (): string | null => {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

export const setAdminToken = (token: string): void => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
};

export const clearAdminToken = (): void => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
};

const authHeader = (): Record<string, string> => {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errText = await res.text();
    let message = `API request failed with status ${res.status}`;
    try {
      const errJson = JSON.parse(errText);
      message = errJson.error || errJson.message || message;
    } catch {
      if (errText) message = errText;
    }
    throw new Error(message);
  }
  return res.json();
}

export const api = {
  // Public APIs
  getPublicData: async (): Promise<{
    categories: Category[];
    subcategories: Subcategory[];
    calculators: Calculator[];
    siteSettings: SiteSettings;
  }> => {
    const res = await fetch('/api/public/data');
    return handleResponse(res);
  },

  getPublicCategories: async (): Promise<Category[]> => {
    const res = await fetch('/api/public/categories');
    return handleResponse(res);
  },

  getPublicSubcategories: async (): Promise<Subcategory[]> => {
    const res = await fetch('/api/public/subcategories');
    return handleResponse(res);
  },

  getPublicCalculators: async (): Promise<Calculator[]> => {
    const res = await fetch('/api/public/calculators');
    return handleResponse(res);
  },

  getPublicSettings: async (): Promise<SiteSettings> => {
    const res = await fetch('/api/public/settings');
    return handleResponse(res);
  },

  getPublicPosts: async (): Promise<BlogPost[]> => {
    const res = await fetch('/api/public/posts');
    return handleResponse(res);
  },

  getPublicPostBySlug: async (slug: string): Promise<BlogPost> => {
    const res = await fetch(`/api/public/posts/${slug}`);
    return handleResponse(res);
  },

  // Auth APIs
  login: async (credentials: { username: string; passwordHash: string }): Promise<{ token: string; message?: string }> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(res);
  },

  verifyToken: async (): Promise<{ valid: boolean }> => {
    const res = await fetch('/api/auth/verify', {
      headers: { ...authHeader() },
    });
    return handleResponse(res);
  },

  checkAuth: async (): Promise<boolean> => {
    try {
      const res = await api.verifyToken();
      return Boolean(res.valid);
    } catch {
      return false;
    }
  },

  logout: (): void => {
    clearAdminToken();
  },

  resolvePath: async (path: string): Promise<any> => {
    const res = await fetch(`/api/public/resolve?path=${encodeURIComponent(path)}`);
    return handleResponse(res);
  },

  getStats: async (): Promise<any> => {
    const res = await fetch('/api/admin/stats', { headers: { ...authHeader() } });
    return handleResponse(res);
  },

  adminGetBlogCategories: async (): Promise<any[]> => {
    const res = await fetch('/api/admin/blog-categories', { headers: { ...authHeader() } });
    return handleResponse(res);
  },

  adminGetBlogSubcategories: async (): Promise<any[]> => {
    const res = await fetch('/api/admin/blog-subcategories', { headers: { ...authHeader() } });
    return handleResponse(res);
  },

  // Admin APIs
  getCategories: async (): Promise<Category[]> => {
    const res = await fetch('/api/admin/categories', { headers: { ...authHeader() } });
    return handleResponse(res);
  },

  saveCategory: async (category: Partial<Category>): Promise<Category> => {
    const method = category.id ? 'PUT' : 'POST';
    const url = category.id ? `/api/admin/categories/${category.id}` : '/api/admin/categories';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(category),
    });
    return handleResponse(res);
  },

  deleteCategory: async (id: string, force = false): Promise<{ success: boolean }> => {
    const url = `/api/admin/categories/${id}${force ? '?force=true' : ''}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { ...authHeader() },
    });
    return handleResponse(res);
  },

  getSubcategories: async (): Promise<Subcategory[]> => {
    const res = await fetch('/api/admin/subcategories', { headers: { ...authHeader() } });
    return handleResponse(res);
  },

  saveSubcategory: async (subcategory: Partial<Subcategory>): Promise<Subcategory> => {
    const method = subcategory.id ? 'PUT' : 'POST';
    const url = subcategory.id ? `/api/admin/subcategories/${subcategory.id}` : '/api/admin/subcategories';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(subcategory),
    });
    return handleResponse(res);
  },

  deleteSubcategory: async (id: string, force = false): Promise<{ success: boolean }> => {
    const url = `/api/admin/subcategories/${id}${force ? '?force=true' : ''}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { ...authHeader() },
    });
    return handleResponse(res);
  },

  getCalculators: async (): Promise<Calculator[]> => {
    const res = await fetch('/api/admin/calculators', { headers: { ...authHeader() } });
    return handleResponse(res);
  },

  saveCalculator: async (calculator: Partial<Calculator>): Promise<Calculator> => {
    const method = calculator.id ? 'PUT' : 'POST';
    const url = calculator.id ? `/api/admin/calculators/${calculator.id}` : '/api/admin/calculators';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(calculator),
    });
    return handleResponse(res);
  },

  deleteCalculator: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`/api/admin/calculators/${id}`, {
      method: 'DELETE',
      headers: { ...authHeader() },
    });
    return handleResponse(res);
  },

  getSettings: async (): Promise<SiteSettings> => {
    const res = await fetch('/api/admin/settings', { headers: { ...authHeader() } });
    return handleResponse(res);
  },

  saveSettings: async (settings: Partial<SiteSettings>): Promise<SiteSettings> => {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(settings),
    });
    return handleResponse(res);
  },

  getPosts: async (): Promise<BlogPost[]> => {
    const res = await fetch('/api/admin/posts', { headers: { ...authHeader() } });
    return handleResponse(res);
  },

  savePost: async (post: Partial<BlogPost>): Promise<BlogPost> => {
    const method = post.id ? 'PUT' : 'POST';
    const url = post.id ? `/api/admin/posts/${post.id}` : '/api/admin/posts';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(post),
    });
    return handleResponse(res);
  },

  deletePost: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`/api/admin/posts/${id}`, {
      method: 'DELETE',
      headers: { ...authHeader() },
    });
    return handleResponse(res);
  },
};
