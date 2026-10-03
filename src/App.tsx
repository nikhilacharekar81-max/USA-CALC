import React, { useState, useEffect } from 'react';
import { api } from './services/api.ts';
import { Header } from './components/layout/Header.tsx';
import { Footer } from './components/layout/Footer.tsx';
import { SearchModal } from './components/common/SearchModal.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { CategoryPage } from './pages/CategoryPage.tsx';
import { SubcategoryPage } from './pages/SubcategoryPage.tsx';
import { CalculatorPage } from './pages/CalculatorPage.tsx';
import { SearchPage } from './pages/SearchPage.tsx';
import { EmptyState } from './components/common/EmptyState.tsx';
import { AlertCircle } from 'lucide-react';
import { Category, Subcategory, Calculator, SiteSettings, BlogPost } from './types/schema.ts';
import { BlogIndexPage } from './pages/BlogIndexPage.tsx';
import { BlogPostPage } from './pages/BlogPostPage.tsx';
import { AdminBlogCategories } from './pages/admin/AdminBlogCategories.tsx';

// Code-split admin pages
const AdminLoginPage = React.lazy(() =>
  import('./pages/AdminLoginPage.tsx').then((m) => ({ default: m.AdminLoginPage }))
);
const AdminLayout = React.lazy(() =>
  import('./components/admin/AdminLayout.tsx').then((m) => ({ default: m.AdminLayout }))
);
const AdminDashboard = React.lazy(() =>
  import('./pages/admin/AdminDashboard.tsx').then((m) => ({ default: m.AdminDashboard }))
);
const AdminCategories = React.lazy(() =>
  import('./pages/admin/AdminCategories.tsx').then((m) => ({ default: m.AdminCategories }))
);
const AdminSubcategories = React.lazy(() =>
  import('./pages/admin/AdminSubcategories.tsx').then((m) => ({ default: m.AdminSubcategories }))
);
const AdminCalculators = React.lazy(() =>
  import('./pages/admin/AdminCalculators.tsx').then((m) => ({ default: m.AdminCalculators }))
);
const AdminCalculatorEditor = React.lazy(() =>
  import('./pages/admin/AdminCalculatorEditor.tsx').then((m) => ({ default: m.AdminCalculatorEditor }))
);
const AdminModules = React.lazy(() =>
  import('./pages/admin/AdminModules.tsx').then((m) => ({ default: m.AdminModules }))
);
const AdminContentSeo = React.lazy(() =>
  import('./pages/admin/AdminContentSeo.tsx').then((m) => ({ default: m.AdminContentSeo }))
);
const AdminSettings = React.lazy(() =>
  import('./pages/admin/AdminSettings.tsx').then((m) => ({ default: m.AdminSettings }))
);
const AdminEmbedStudio = React.lazy(() =>
  import('./pages/admin/AdminEmbedStudio.tsx').then((m) => ({ default: m.AdminEmbedStudio }))
);
const AdminBlogManager = React.lazy(() =>
  import('./pages/admin/AdminBlogManager.tsx').then((m) => ({ default: m.AdminBlogManager }))
);
const AdminBlogEditor = React.lazy(() =>
  import('./pages/admin/AdminBlogEditor.tsx').then((m) => ({ default: m.AdminBlogEditor }))
);
const AdminBlogDashboard = React.lazy(() =>
  import('./pages/admin/AdminBlogDashboard.tsx').then((m) => ({ default: m.AdminBlogDashboard }))
);

const isSubpagePath = (path: string) => {
  return path !== '/' && path !== '' && !path.startsWith('/admin') && path !== '/search' && !path.startsWith('/blog');
};

const getNormalizedPath = () => {
  if (typeof window === 'undefined') return '/';
  if (window.location.hash && window.location.hash.startsWith('#/')) {
    return window.location.hash.replace(/^#/, '');
  }
  return window.location.pathname;
};

export function App() {
  const [currentPath, setCurrentPath] = useState(getNormalizedPath);
  const [activeTab, setActiveTab] = useState<'tax' | 'mortgage' | 'retirement' | 'sales'>('tax');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean | null>(null);
  const [adminTab, setAdminTab] = useState<
    | 'dashboard'
    | 'categories'
    | 'subcategories'
    | 'calculators'
    | 'modules'
    | 'content-seo'
    | 'settings'
    | 'calculator-editor'
    | 'embed-studio'
    | 'blogs'
    | 'blog-editor'
    | 'blog-categories'
    | 'blog-dashboard'
  >('dashboard');
  const [activeCalculatorId, setActiveCalculatorId] = useState<string>('new');
  const [activeBlogPost, setActiveBlogPost] = useState<BlogPost | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Global Datasets
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<Subcategory[]>([]);
  const [allCalculators, setAllCalculators] = useState<Calculator[]>([]);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);

  // Dynamic Route Resolver State
  const [routeData, setRouteData] = useState<{
    type: 'home' | 'category' | 'subcategory' | 'calculator';
    category?: Category;
    subcategory?: Subcategory;
    subcategories?: Subcategory[];
    calculators?: Calculator[];
    calculator?: Calculator;
    siblingSubcategories?: Subcategory[];
    relatedCalculators?: Calculator[];
  } | null>(null);

  const [routeLoading, setRouteLoading] = useState(false);
  const [routeNotFound, setRouteNotFound] = useState(false);

  // Load Global Data
  useEffect(() => {
    Promise.all([
      api.getPublicCategories(),
      api.getPublicSubcategories(),
      api.getPublicCalculators(),
      api.getPublicPosts(),
    ])
      .then(([cats, subs, calcs, posts]) => {
        setAllCategories(cats || []);
        setAllSubcategories(subs || []);
        setAllCalculators(calcs || []);
        setAllPosts(posts || []);
      })
      .catch((err) => console.error('Initial data load error:', err));
  }, []);

  // Synchronize browser history navigation
  useEffect(() => {
    const handleNavigation = () => {
      setCurrentPath(getNormalizedPath());
    };
    window.addEventListener('popstate', handleNavigation);
    window.addEventListener('hashchange', handleNavigation);
    return () => {
      window.removeEventListener('popstate', handleNavigation);
      window.removeEventListener('hashchange', handleNavigation);
    };
  }, []);

  // Global hotkey for search modal (`/` or `Ctrl+K`)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key === 'k')) &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check Admin Authentication
  useEffect(() => {
    if (currentPath.startsWith('/admin')) {
      api.checkAuth().then((auth) => {
        setIsAdminAuthenticated(auth);
      });

      const segments = currentPath.split('/').filter(Boolean);
      if (segments[1] === 'categories') setAdminTab('categories');
      else if (segments[1] === 'subcategories') setAdminTab('subcategories');
      else if (segments[1] === 'modules') setAdminTab('modules');
      else if (segments[1] === 'content-seo') setAdminTab('content-seo');
      else if (segments[1] === 'embed-studio') setAdminTab('embed-studio');
      else if (segments[1] === 'calculators') {
        if (segments[2]) {
          setAdminTab('calculator-editor');
          setActiveCalculatorId(segments[2]);
        } else {
          setAdminTab('calculators');
        }
      } else if (segments[1] === 'blogs') setAdminTab('blogs');
      else if (segments[1] === 'blog-categories') setAdminTab('blog-categories');
      else if (segments[1] === 'blog-dashboard') setAdminTab('blog-dashboard');
      else if (segments[1] === 'settings') setAdminTab('settings');
      else setAdminTab('dashboard');
    }
  }, [currentPath]);

  // Resolve Public Dynamic Routes
  useEffect(() => {
    if (
      currentPath.startsWith('/admin') ||
      currentPath === '/search' ||
      currentPath === '/blog' ||
      currentPath.startsWith('/blog/')
    ) {
      setRouteLoading(false);
      setRouteNotFound(false);
      return;
    }

    if (currentPath === '/' || currentPath === '') {
      setRouteData({ type: 'home' });
      setRouteNotFound(false);
      setRouteLoading(false);
      return;
    }

    let isCancelled = false;
    setRouteLoading(true);
    setRouteNotFound(false);

    api
      .resolvePath(currentPath)
      .then((data: any) => {
        if (isCancelled) return;
        setRouteData(data);
        setRouteNotFound(false);
      })
      .catch((err: any) => {
        if (isCancelled) return;
        setRouteNotFound(true);
      })
      .finally(() => {
        if (isCancelled) return;
        setRouteLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [currentPath]);

  const handleAdminNavigate = (tab: typeof adminTab, param?: string) => {
    setAdminTab(tab);
    if (tab === 'calculator-editor' && param) {
      setActiveCalculatorId(param);
      window.history.pushState({}, '', `/admin/calculators/${param}`);
    } else if (tab === 'dashboard') {
      window.history.pushState({}, '', '/admin');
    } else {
      window.history.pushState({}, '', `/admin/${tab}`);
    }
  };

  const navigateTo = (url: string) => {
    if (url === currentPath) return;
    if (window.location.hash && window.location.hash.startsWith('#/')) {
      window.location.hash = `#${url}`;
    } else {
      window.history.pushState({}, '', url);
    }
    setCurrentPath(url);
    window.scrollTo(0, 0);
  };

  // ==========================================
  // ADMIN CONSOLE ROUTE
  // ==========================================
  if (currentPath.startsWith('/admin')) {
    if (isAdminAuthenticated === null) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-400">
          Verifying authorization...
        </div>
      );
    }

    if (!isAdminAuthenticated) {
      return (
        <React.Suspense
          fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-400">
              Loading sign in...
            </div>
          }
        >
          <AdminLoginPage
            onLoginSuccess={() => {
              setIsAdminAuthenticated(true);
              setAdminTab('dashboard');
              navigateTo('/admin');
            }}
          />
        </React.Suspense>
      );
    }

    return (
      <React.Suspense
        fallback={
          <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-400">
            Loading admin console...
          </div>
        }
      >
        <AdminLayout
          currentTab={adminTab}
          onNavigate={handleAdminNavigate}
          onLogout={() => {
            api.logout();
            setIsAdminAuthenticated(false);
            navigateTo('/admin');
          }}
        >
          {adminTab === 'dashboard' && <AdminDashboard onNavigate={handleAdminNavigate} />}
          {adminTab === 'blog-dashboard' && <AdminBlogDashboard />}
          {adminTab === 'categories' && <AdminCategories />}
          {adminTab === 'subcategories' && <AdminSubcategories />}
          {adminTab === 'calculators' && <AdminCalculators />}
          {adminTab === 'modules' && <AdminModules />}
          {adminTab === 'content-seo' && <AdminContentSeo />}
          {adminTab === 'embed-studio' && <AdminEmbedStudio />}
          {adminTab === 'blogs' && <AdminBlogManager />}
          {adminTab === 'blog-editor' && (
            <AdminBlogEditor
              post={activeBlogPost}
              onBack={() => setAdminTab('blogs')}
              onSaved={() => setAdminTab('blogs')}
            />
          )}
          {adminTab === 'blog-categories' && <AdminBlogCategories />}
          {adminTab === 'calculator-editor' && (
            <AdminCalculatorEditor id={activeCalculatorId} />
          )}
          {adminTab === 'settings' && <AdminSettings />}
        </AdminLayout>
      </React.Suspense>
    );
  }

  // ==========================================
  // PUBLIC WEBSITE ROUTES
  // ==========================================
  const blogPostSlug = currentPath.startsWith('/blog/') ? currentPath.split('/')[2] : '';
  const currentBlogPost = blogPostSlug ? allPosts.find((p) => p.slug === blogPostSlug) : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-[#1dbf73] selection:text-white w-full max-w-full overflow-x-hidden">
      <Header
        onOpenSearch={() => setIsSearchModalOpen(true)}
        brandName="Calculator.net Engine"
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (currentPath !== '/' && currentPath !== '') {
            navigateTo(`/#${tab}`);
          }
        }}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
        {currentPath === '/search' ? (
          <SearchPage
            calculators={allCalculators}
            categories={allCategories}
            subcategories={allSubcategories}
          />
        ) : currentPath === '/blog' ? (
          <BlogIndexPage posts={allPosts} />
        ) : currentPath.startsWith('/blog/') ? (
          currentBlogPost ? (
            <BlogPostPage post={currentBlogPost} />
          ) : (
            <EmptyState
              title="Article Not Found"
              description="The requested guide could not be found."
              actionText="Back to Blog"
              actionHref="/blog"
            />
          )
        ) : currentPath === '/' || currentPath === '' ? (
          <HomePage
            onOpenSearch={() => setIsSearchModalOpen(true)}
            brandName="Calculator.net Engine"
            activeTab={activeTab}
          />
        ) : routeLoading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#1dbf73] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-400">Loading calculator engine...</p>
          </div>
        ) : routeNotFound ? (
          <EmptyState
            title="Calculator Not Found"
            description="The requested tool or category is not available."
            actionText="Return to Homepage"
            actionHref="/"
          />
        ) : routeData?.type === 'category' && routeData.category ? (
          <CategoryPage
            category={routeData.category}
            subcategories={routeData.subcategories || []}
            calculators={routeData.calculators || []}
          />
        ) : routeData?.type === 'subcategory' && routeData.category && routeData.subcategory ? (
          <SubcategoryPage
            category={routeData.category}
            subcategory={routeData.subcategory}
            calculators={routeData.calculators || []}
          />
        ) : routeData?.type === 'calculator' && routeData.category && routeData.subcategory && routeData.calculator ? (
          <CalculatorPage
            category={routeData.category}
            subcategory={routeData.subcategory}
            calculator={routeData.calculator}
            relatedCalculators={routeData.relatedCalculators || []}
          />
        ) : (
          <div className="py-16 text-center text-xs text-slate-400">
            Initializing calculation workspace...
          </div>
        )}
      </main>

      <Footer brandName="Calculator.net Engine" />

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        calculators={allCalculators}
        categories={allCategories}
        subcategories={allSubcategories}
      />
    </div>
  );
}

export default App;
