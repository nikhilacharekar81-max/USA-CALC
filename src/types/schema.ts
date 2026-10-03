export type FieldType = 'number' | 'slider' | 'select' | 'radio' | 'checkbox' | 'date';

export type OutputFormat = 'currency' | 'currency_inr' | 'percent' | 'integer' | 'decimal_2' | 'decimal_4' | 'number' | 'time_duration' | 'text';

export interface FieldOption {
  label: string;
  value: string | number;
}

export interface CalculatorField {
  id: string; // variable identifier, e.g. 'amount', 'interestRate', 'income'
  label: string;
  type: FieldType;
  defaultValue: number | string | boolean;
  placeholder?: string;
  prefix?: string; // e.g. '$', '₹'
  suffix?: string; // e.g. '%', 'kg', 'years', 'sq ft'
  min?: number;
  max?: number;
  step?: number;
  options?: FieldOption[];
  helpText?: string;
  required?: boolean;
  isAdvanced?: boolean; // When true, grouped under collapsible Advanced Options accordion
}

export interface CalculatorOutput {
  id: string; // variable identifier, e.g. 'monthlyEmi', 'totalInterest'
  label: string;
  formula: string; // math expression or specialized engine key
  format: OutputFormat;
  prefix?: string;
  suffix?: string;
  highlight?: boolean; // prominent KPI hero card
  description?: string;
}

export interface CalculatorPreset {
  id: string;
  name: string;
  description?: string;
  values: Record<string, number | string | boolean>;
}

// Module Configuration per Calculator
export interface CalculatorModuleConfig {
  id: string;
  moduleId: string; // references ModuleRegistry ID
  name: string;
  isEnabled: boolean;
  order: number;
  settings: Record<string, any>;
}

// Rich Text Content Section
export interface ContentSection {
  id: string;
  title: string;
  htmlContent: string;
  isEnabled: boolean;
  order: number;
  sectionType?: 'overview' | 'how-to' | 'formula' | 'methodology' | 'assumptions' | 'pitfalls' | 'custom';
}

// FAQ item
export interface CalculatorFAQ {
  id: string;
  question: string;
  answer: string;
  isEnabled: boolean;
  order: number;
}

// Worked Example item
export interface CalculatorExample {
  id: string;
  title: string;
  description: string;
  inputValues?: Record<string, any>;
  resultSummary?: string;
  isEnabled: boolean;
  order: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  icon?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Calculator {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  categoryId: string;
  subcategoryId: string;
  icon?: string;
  engineType?: string; // 'custom_formula' | 'auto_loan' | 'mortgage' | 'compound' | 'debt_payoff' | 'personal_loan' | 'income_tax' | 'gst' | 'sip' | 'land_unit' | 'health_bmi'
  fields: CalculatorField[];
  outputs: CalculatorOutput[];
  presets?: CalculatorPreset[];
  modules?: CalculatorModuleConfig[];
  contentSections?: ContentSection[];
  content?: {
    usageInstructions?: string;
    formulaExplanation?: string;
    faqs?: Array<{ question: string; answer: string }>;
  };
  faqs?: CalculatorFAQ[];
  examples?: CalculatorExample[];
  chartConfig?: {
    enabled: boolean;
    chartType: 'area' | 'bar' | 'donut' | 'line' | 'trajectory' | 'montecarlo';
    title: string;
    segments?: Array<{ label: string; outputId: string; color?: string }>;
  };
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
  order: number;
  isActive: boolean;
  isFeatured?: boolean;
  isPopular?: boolean;
  viewsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string;
  brandName: string;
  adminUsername: string;
  adminPasswordHash: string;
  footerNotice: string;
  canonicalBaseUrl: string;
  contactEmail?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  coverImage?: string;
  category: string; // legacy category string
  blogCategoryId?: string;
  blogSubcategoryId?: string;
  tags: string[];
  author: {
    name: string;
    role: string;
    avatar: string;
    bio?: string;
  } | string;
  status: 'published' | 'draft' | 'archived';
  isPublished?: boolean;
  publishedAt: string;
  updatedAt: string;
  readTimeMinutes: number;
  views: number;
  isFeatured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  embeddedCalculators?: string[];
  showFeaturedImage?: boolean;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order?: number;
  isActive?: boolean;
  postCount?: number;
  subcategoriesCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogSubcategory {
  id: string;
  blogCategoryId: string;
  name: string;
  slug: string;
  description?: string;
  order?: number;
  isActive?: boolean;
  postCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DatabaseSchema {
  categories: Category[];
  subcategories: Subcategory[];
  calculators: Calculator[];
  posts?: BlogPost[];
  blogCategories?: BlogCategory[];
  blogSubcategories?: BlogSubcategory[];
  settings: SiteSettings;
}

export interface StatsResponse {
  totalCategories: number;
  activeCategories: number;
  totalSubcategories: number;
  activeSubcategories: number;
  totalCalculators: number;
  activeCalculators: number;
}

export function isCalculatorModuleConfig(item: any): item is CalculatorModuleConfig {
  return (
    item &&
    typeof item === 'object' &&
    typeof item.id === 'string' &&
    typeof item.moduleId === 'string' &&
    typeof item.name === 'string' &&
    (item.isEnabled === true || item.isEnabled === false) &&
    typeof item.order === 'number'
  );
}
