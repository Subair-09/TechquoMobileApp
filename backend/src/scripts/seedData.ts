import { connectDB } from '../config/db.js';
import { Category } from '../models/Category.js';
import { Author } from '../models/Author.js';
import { Article } from '../models/Article.js';
import { Comment } from '../models/Comment.js';
import { ArticleView } from '../models/ArticleView.js';
import { AdminUser } from '../models/AdminUser.js';
import { initializeAdmin } from './initAdmin.js';

export const seedDatabase = async (): Promise<void> => {
  await connectDB();
  await initializeAdmin();

  console.log('[Seed] Seeding sample editorial database for TechQuo News...');

  // 1. Categories
  const categoriesData = [
    { name: 'Technology', slug: 'technology', description: 'AI, software, hardware, and climate technology', icon: 'Cpu' },
    { name: 'Business', slug: 'business', description: 'Markets, corporate strategy, and creator infrastructure', icon: 'Briefcase' },
    { name: 'FinTech', slug: 'fintech', description: 'Payments, cross-border rails, and digital banking', icon: 'CreditCard' },
    { name: 'Startups', slug: 'startups', description: 'Founders, venture capital, and unit economics', icon: 'Rocket' },
    { name: 'Innovation', slug: 'innovation', description: 'Hybrid work, frontier research, and tomorrow\'s ideas', icon: 'Lightbulb' },
    { name: 'Africa', slug: 'africa', description: 'Sovereign digital infrastructure and continental impact', icon: 'Globe' },
  ];

  const categoryMap = new Map();
  for (const cat of categoriesData) {
    const doc = await Category.findOneAndUpdate(
      { slug: cat.slug },
      { ...cat },
      { upsert: true, new: true }
    );
    categoryMap.set(cat.slug, doc._id);
  }

  // 2. Authors
  const authorsData = [
    {
      name: 'Nurudeen Adewale',
      slug: 'nurudeen-adewale',
      role: 'Senior Technology Editor',
      bio: 'Reporting on artificial intelligence, climate technology, and digital sovereignty across West Africa.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      email: 'nurudeen@techquo.news',
    },
    {
      name: 'Amara Okafor',
      slug: 'amara-okafor',
      role: 'Business & Media Lead',
      bio: 'Covering creator monetization, video infrastructure, and telecommunications.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      email: 'amara@techquo.news',
    },
    {
      name: 'David Mensah',
      slug: 'david-mensah',
      role: 'Innovation Columnist',
      bio: 'Software engineer and author studying distributed systems and asynchronous workflows.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
      email: 'david@techquo.news',
    },
    {
      name: 'Zainab Traore',
      slug: 'zainab-traore',
      role: 'Africa Tech Lead',
      bio: 'Tracking seed-stage venture flows and sovereign language models in Francophone and Anglophone Africa.',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
      email: 'zainab@techquo.news',
    },
  ];

  const authorMap = new Map();
  for (const auth of authorsData) {
    const doc = await Author.findOneAndUpdate(
      { slug: auth.slug },
      { ...auth, isActive: true },
      { upsert: true, new: true }
    );
    authorMap.set(auth.slug, doc._id);
  }

  const superAdmin = await AdminUser.findOne({ role: 'super_admin' });

  // 3. Articles (matching the reference dashboard screenshot)
  const articlesData = [
    {
      title: 'The Intelligence of Living: How LetPlant is Redefining Climate Tech from the Living Room Up',
      slug: 'letplant-redefining-climate-tech-living-room',
      categorySlug: 'technology',
      authorSlug: 'nurudeen-adewale',
      coverImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
      status: 'published',
      featured: true,
      views: 0,
      readingTime: '5 min read',
      publishedAt: new Date('2026-09-01T10:00:00Z'),
      excerpt: 'From plant care to intelligent living, LetPlant is exploring how AI and environmental data can transform the spaces people inhabit every day.',
      body: `From plant care to intelligent living, LetPlant is exploring how AI and environmental data can transform the spaces people inhabit every day.\n\nThe startup is building a new generation of smart indoor ecosystems that combine technology, sustainability, and everyday convenience. With a focus on climate resilience and urban living, LetPlant is showing how innovation can bring nature closer to home.\n\n### The Problem with Disconnected Urban Living\n\nAs urban density increases across Lagos, Nairobi, and Johannesburg, indoor spaces have become increasingly sterile. The average metropolitan professional spends more than 85% of their working hours inside climate-controlled structures.\n\nLetPlant couples high-density biophilic micro-chambers with micro-sensors that measure volatile organic compounds, ambient light intensity, and local carbon saturation.`,
      tags: ['ClimateTech', 'ArtificialIntelligence', 'Hardware'],
    },
    {
      title: 'Redefining content sovereignty: how Snapvid is reengineering video infrastructure for the global creator...',
      slug: 'redefining-content-sovereignty-snapvid-video-infrastructure',
      categorySlug: 'business',
      authorSlug: 'amara-okafor',
      coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
      status: 'published',
      featured: false,
      views: 0,
      readingTime: '4 min read',
      publishedAt: new Date('2026-09-01T14:30:00Z'),
      excerpt: 'How decentralized creator networks and edge-optimized transcoding are enabling digital creators across emerging markets to control their distribution channels.',
      body: `In an era dominated by hyper-centralized video platforms, digital creators are frequently subjected to algorithmic whims and prohibitive revenue splits.\n\nSnapVid, an emerging media infrastructure platform founded between Nairobi and London, is mounting a technological challenge to the status quo by introducing decentralized transcoding pipelines and peer-assisted distribution protocols.`,
      tags: ['MediaTech', 'CreatorEconomy', 'Infrastructure'],
    },
    {
      title: 'The Architecture of Ambition: Why Waivly is Redefining Professional Proximity',
      slug: 'architecture-ambition-waivly-professional-proximity',
      categorySlug: 'innovation',
      authorSlug: 'david-mensah',
      coverImage: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=1200&auto=format&fit=crop&q=80',
      status: 'published',
      featured: false,
      views: 0,
      readingTime: '6 min read',
      publishedAt: new Date('2026-08-31T09:15:00Z'),
      excerpt: 'Remote work promised ultimate freedom but fractured institutional memory. Waivly’s spatial collaboration platform is creating a new dynamic for fast-scaling engineering teams.',
      body: `The abrupt shift toward fully distributed employment promised unprecedented geographic liberation for African software engineers. Waivly focuses on ambient audio fidelity, contextual codebase synchronization, and lightweight presence awareness.`,
      tags: ['RemoteWork', 'SoftwareEngineering', 'FutureOfWork'],
    },
    {
      title: 'How Artificial Intelligence is Transforming Africa\'s Startup Ecosystem',
      slug: 'ai-transforming-africas-startup-ecosystem',
      categorySlug: 'africa',
      authorSlug: 'zainab-traore',
      coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
      status: 'published',
      featured: false,
      views: 0,
      readingTime: '5 min read',
      publishedAt: new Date('2026-08-28T16:00:00Z'),
      excerpt: 'From localized multilingual models to autonomous credit underwriting, founders are bypassing legacy enterprise models to build high-impact native AI applications.',
      body: `Across the continent, artificial intelligence has ceased to be an academic novelty or an imported luxury. Instead, African startup founders are deploying localized intelligence models directly into agriculture, financial inclusion, and healthcare triage.`,
      tags: ['AI', 'Startups', 'Fintech', 'Africa'],
    },
    {
      title: 'The Cross-Border Liquidity Frontier: Inside Africa\'s Next FinTech Revolution',
      slug: 'cross-border-liquidity-frontier-fintech-revolution',
      categorySlug: 'fintech',
      authorSlug: 'nurudeen-adewale',
      coverImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80',
      status: 'published',
      featured: false,
      views: 0,
      readingTime: '5 min read',
      publishedAt: new Date('2026-08-25T11:20:00Z'),
      excerpt: 'How real-time settlement rails and digital asset corridors are dismantling intra-continental trade barriers faster than international treaties.',
      body: `For decades, sending money between neighbouring African economies required routing funds through intermediary banks in Europe or North America. Real-time gross settlement architectures are finally making intra-African payments instantaneous.`,
      tags: ['FinTech', 'Payments', 'Trade'],
    },
    {
      title: 'Capital Efficiency Over Blitzscaling: The New Playbook for African Founders',
      slug: 'capital-efficiency-new-playbook-african-founders',
      categorySlug: 'startups',
      authorSlug: 'amara-okafor',
      coverImage: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=1200&auto=format&fit=crop&q=80',
      status: 'published',
      featured: false,
      views: 0,
      readingTime: '4 min read',
      publishedAt: new Date('2026-08-22T08:00:00Z'),
      excerpt: 'Venture dynamics have shifted globally. African founders who prioritized unit economics and sustainable revenue from day one are now outperforming their capital-hungry peers.',
      body: `The era of growth-at-all-costs has officially concluded. Across technology hubs from Cairo to Cape Town, venture capitalists and startup operators are aligning around a new paradigm: resilient unit economics and customer-funded expansion.`,
      tags: ['Startups', 'VentureCapital', 'Economics'],
    },
  ];

  for (const art of articlesData) {
    const categoryId = categoryMap.get(art.categorySlug);
    const authorId = authorMap.get(art.authorSlug);

    const article = await Article.findOneAndUpdate(
      { slug: art.slug },
      {
        ...art,
        categoryId,
        authorId,
        createdBy: superAdmin?._id,
        updatedBy: superAdmin?._id,
      },
      { upsert: true, new: true }
    );
  }

  console.log('[Seed Success] Database successfully populated with initial editorial dataset.');
};

if (process.argv[1]?.endsWith('seedData.ts') || process.argv[1]?.endsWith('seedData.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed Error]:', err);
      process.exit(1);
    });
}
