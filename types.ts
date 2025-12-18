
export type Language = 'zh' | 'en';

export enum Category {
  ALL = 'All',
  VIDEO = 'Videography',
  DESIGN = 'Graphics & UI',
  PHOTO = 'Photography',
  DEV = 'Development',
  ARTICLE = 'Article'
}

export type ArticleCategory = string; // 动态分类，基于文件夹名

export interface Article {
  id: string;
  title: string;
  category: ArticleCategory;
  link: string; // 内部链接，基于 id
  coverImage?: string; // Optional, will fallback if not provided
  date?: string;
  content?: string; // Markdown 内容
  tags?: string[]; // 从 YAML 解析
}

export interface Project {
  id: string;
  common?: {
    category: Category;
    image: string;
    icon?: string;
    websiteUrl?: string;
    githubUrl?: string;
  };
  zh?: {
    title: string;
    subtitle: string;
    description: string;
    role: string;
    tags: string[];
    roleDetail?: string;
  };
  en?: {
    title: string;
    subtitle: string;
    description: string;
    role: string;
    tags: string[];
    roleDetail?: string;
  };
  // New detailed fields
  concept?: string;
  roleDetail?: string;
  awards?: string[]; // Array of award strings

  // Special field for placeholder UI
  bilingualTitle?: {
    zh: string;
    en: string;
  };

  videoUrl?: string; // URL to .mp4 file
  bilibiliId?: string; // Bilibili Video ID (e.g. BV1xx...)
  figmaUrl?: string; // Figma File URL
  gallery?: string[]; // Additional images (URLs)
  externalLink?: string; // External link (e.g. Bilibili, Behance)
  websiteUrl?: string; // Online preview URL
  githubUrl?: string; // GitHub repository URL
  icon?: string; // Icon name for Dev projects
}

export interface Experience {
  id: string;
  year: string;
  title: string;
  institution: string;
  description: string;
  type: 'education' | 'work';
}

export interface Skill {
  name: string;
  level: number; // 0-100
  icon?: string;
}

export interface CompetitionGroup {
  level: string;
  awards: string[];
}

export interface HonorsData {
  scholarships: string[];
  titles: string[];
  competitions: CompetitionGroup[];
}
