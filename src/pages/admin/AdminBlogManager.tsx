import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { BlogPost } from '../../types/schema.ts';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';

export const AdminBlogManager: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  const loadData = async () => {
    try {
      const data = await api.getPosts();
      setPosts(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    try {
      await api.deletePost(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error deleting post');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Manage Blog & Guides</h1>
          <p className="text-xs text-slate-500">Publish and edit financial articles and calculation guides</p>
        </div>
        <a
          href="/admin/blog/new"
          className="px-4 py-2 bg-[#1dbf73] hover:bg-[#19a463] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Article</span>
        </a>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-3.5">Title</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Author</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {posts.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-3.5 font-bold text-slate-900">{p.title}</td>
                <td className="p-3.5 text-slate-600">{p.category || 'General'}</td>
                <td className="p-3.5 text-slate-600">
                  {typeof p.author === 'string' ? p.author : p.author?.name || 'Admin'}
                </td>
                <td className="p-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <a
                      href={`/blog/${p.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={`/admin/blog/${p.id}`}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
