import { Article, Author, Category, Comment, AppNotification, User } from '../types';

export const CURRENT_USER: User = {
  id: 'usr_nurudeen_01',
  name: 'Nurudeen Adewale',
  username: 'nurudeen',
  email: 'nurudeen.adewale@techquo.news',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  isPremium: false,
  preferences: {
    notificationsEnabled: true,
    fontSize: 'md',
    offlineReading: true,
    hapticsEnabled: true,
  },
};

export const AUTHORS: Record<string, Author> = {
  'auth_1': {
    id: 'auth_1',
    name: 'Nurudeen Adewale',
    avatar: 'https://res.cloudinary.com/djonulqfz/image/upload/v1791812516/techquo/authors/pruzptg1k5zgridcwij0.jpg',
    bio: 'Senior Technology Editor at TechQuo News. Reporting on artificial intelligence, climate technology, and digital sovereignty.',
    role: 'Senior Technology Editor',
  },
  'auth_2': {
    id: 'auth_2',
    name: 'Amara Okafor',
    avatar: 'https://res.cloudinary.com/djonulqfz/image/upload/v1791812517/techquo/authors/budmlpknqji2fbjywjoe.jpg',
    bio: 'Business & Media correspondent focusing on the creator economy, digital platforms, and African media infrastructure.',
    role: 'Business & Media Lead',
  },
  'auth_3': {
    id: 'auth_3',
    name: 'David Mensah',
    avatar: 'https://res.cloudinary.com/djonulqfz/image/upload/v1791812518/techquo/authors/c7xdlaxhjrjuc2iorhn8.jpg',
    bio: 'Software architect and essayist analyzing hybrid workplace dynamics and distributed systems across emerging markets.',
    role: 'Innovation Columnist',
  },
  'auth_4': {
    id: 'auth_4',
    name: 'Zainab Traore',
    avatar: 'https://res.cloudinary.com/djonulqfz/image/upload/v1791812519/techquo/authors/jqmdkeeh758wmolqhk6l.jpg',
    bio: 'Emerging tech researcher tracking venture capital flows, enterprise AI, and telecom innovation across West and East Africa.',
    role: 'Africa Tech Lead',
  },
};

export const CATEGORIES: Category[] = [
  {
    id: 'cat_trending',
    name: 'Trending',
    slug: 'trending',
    description: 'Popular and trending stories',
    iconName: 'TrendingUp',
  },
  {
    id: 'cat_tech',
    name: 'Technology',
    slug: 'technology',
    description: 'AI, Software, Gadgets & More',
    iconName: 'Cpu',
  },
  {
    id: 'cat_business',
    name: 'Business',
    slug: 'business',
    description: 'Markets, Economy, Startups',
    iconName: 'Briefcase',
  },
  {
    id: 'cat_fintech',
    name: 'FinTech',
    slug: 'fintech',
    description: 'Payments, Banking, Web3',
    iconName: 'CreditCard',
  },
  {
    id: 'cat_startups',
    name: 'Startups',
    slug: 'startups',
    description: 'Founders, Funding, Growth',
    iconName: 'Rocket',
  },
  {
    id: 'cat_innovation',
    name: 'Innovation',
    slug: 'innovation',
    description: 'Ideas Shaping Tomorrow',
    iconName: 'Lightbulb',
  },
  {
    id: 'cat_africa',
    name: 'Africa',
    slug: 'africa',
    description: 'African Tech & Impact',
    iconName: 'Globe',
  },
  {
    id: 'cat_lifestyle',
    name: 'Lifestyle',
    slug: 'lifestyle',
    description: 'Work, Culture, Health',
    iconName: 'Sparkles',
  },
];

export const ARTICLES: Article[] = [
  {
    id: 'art_1',
    title: 'The Intelligence of Living: How LetPlant is Redefining Climate Tech from the Living Room Up',
    slug: 'letplant-redefining-climate-tech-living-room',
    excerpt: 'From plant care to intelligent living, LetPlant is exploring how AI and environmental data can transform the spaces people inhabit every day.',
    body: `From plant care to intelligent living, LetPlant is exploring how AI and environmental data can transform the spaces people inhabit every day.

The startup is building a new generation of smart indoor ecosystems that combine technology, sustainability, and everyday convenience. With a focus on climate resilience and urban living, LetPlant is showing how innovation can bring nature closer to home.

### The Problem with Disconnected Urban Living

As urban density increases across Lagos, Nairobi, and Johannesburg, indoor spaces have become increasingly sterile. The average metropolitan professional spends more than 85% of their working hours inside climate-controlled structures, largely decoupled from natural ecosystems.

"We began with a very fundamental question," explains Ayodeji Balogun, founder and principal engineer at LetPlant. "Can an indoor plant do more than sit passively on a sill? What if the soil microbiome was the first sensor node in a household environmental intelligence network?"

LetPlant's flagship system couples high-density biophilic micro-chambers with micro-sensors that measure volatile organic compounds (VOCs), ambient humidity, ambient light intensity, and localized CO2 saturation.

### Intelligent Micro-Climates and Localized Machine Learning

Rather than relying on continuous cloud telemetry, the device utilizes an on-device neural processing unit to parse local sensor streams. When localized particulates spike or moisture drops below optimal microbial threshold levels, the system automatically adjusts micro-droplet misting cycles and communicates with domestic air filtration units.

> "True environmental intelligence is not about flashing dashboards or endless smartphone alerts. It is about quiet, autonomous harmony between biological life and mechanical infrastructure."

The company has already completed pilot installations across over 1,400 residences and co-working hubs across West Africa. Early data suggests a 34% reduction in perceived indoor fatigue and measurable drops in airborne particulate concentrations.

### Beyond the Home: Scalable Climate Infrastructure

While consumer adoption has driven initial momentum, LetPlant's ultimate vision extends far beyond decorative home greenery. The company has begun testing modular vertical green façades for commercial office developments across Kigali and Accra.

These commercial installations act as distributed bio-filters, reducing central air conditioning loads by up to 18% during peak solar irradiance hours. By pairing biological transpirational cooling with predictive ventilation algorithms, LetPlant is illustrating how indigenous climate wisdom and contemporary robotics can converge to solve urban heat island effects.

As African cities continue to lead global demographic expansion, innovations that marry ecological preservation with affordable technology will define the next century of infrastructure.`,
    coverImage: 'https://res.cloudinary.com/djonulqfz/image/upload/v1791812458/techquo/articles/nr4hqfavd6k8ylcyugds.jpg',
    category: 'Technology',
    authorId: 'auth_1',
    author: AUTHORS['auth_1'],
    publishedAt: 'September 1, 2026',
    readingTime: '5 min read',
    tags: ['ClimateTech', 'ArtificialIntelligence', 'Hardware', 'UrbanLiving'],
    status: 'published',
    featured: true,
    likesCount: 0,
    commentsCount: 0,
  },
  {
    id: 'art_2',
    title: 'Redefining content sovereignty: how snapvid is reengineering video infrastructure for the global economy',
    slug: 'redefining-content-sovereignty-snapvid-video-infrastructure',
    excerpt: 'How decentralized creator networks and edge-optimized transcoding are enabling digital creators across emerging markets to control their distribution channels.',
    body: `In an era dominated by hyper-centralized video platforms, digital creators are frequently subjected to algorithmic whims and prohibitive revenue splits.

SnapVid, an emerging media infrastructure platform founded between Nairobi and London, is mounting a technological challenge to the status quo by introducing decentralized transcoding pipelines and peer-assisted distribution protocols.

### The High Cost of Video Compute

For creators operating outside tier-one data center regions, bandwidth and processing overhead remain significant bottlenecks. Traditional streaming architectures demand costly centralized encoding clusters, forcing independent media ventures to surrender their audiences to monopolistic ad engines.

SnapVid's approach leverages edge computing nodes deployed across regional internet exchange points (IXPs) in Lagos, Mombasa, and Cairo. By optimizing video codecs specifically for variable 4G and 5G cellular topologies, the platform reduces latency by 62% while slashing distribution costs by more than half.

### Restoring Economic Agency to Storytellers

"Content sovereignty is not merely a philosophical stance; it is an economic necessity," states founder Fatima Al-Hassan. "If you do not own the pipes through which your work reaches your audience, you do not own your business."

The platform introduces verifiable attribution tokens that allow videographers, documentarians, and independent journalists to syndicate high-bitrate footage directly to global subscribers, retaining up to 92% of direct subscription revenues.

With early support from leading venture firms and creator collectives, SnapVid is signaling a decisive shift toward an open, performant, and sovereign digital media ecosystem.`,
    coverImage: 'https://res.cloudinary.com/djonulqfz/image/upload/v1791812459/techquo/articles/pxn41mqjgsv1l3unhbnw.jpg',
    category: 'Business',
    authorId: 'auth_2',
    author: AUTHORS['auth_2'],
    publishedAt: 'September 1, 2026',
    readingTime: '4 min read',
    tags: ['MediaTech', 'CreatorEconomy', 'Infrastructure', 'Decentralization'],
    status: 'published',
    featured: false,
    likesCount: 0,
    commentsCount: 0,
  },
  {
    id: 'art_3',
    title: 'The Architecture of Ambition: Why Waivly Is Redefining Professional Proximity',
    slug: 'architecture-ambition-waivly-professional-proximity',
    excerpt: 'Remote work promised ultimate freedom but fractured institutional memory. Waivly’s spatial collaboration platform is creating a new dynamic for fast-scaling engineering teams.',
    body: `The abrupt shift toward fully distributed employment promised unprecedented geographic liberation for African software engineers. Yet beneath the surface of asynchronous messaging and video calls, engineering leaders began encountering subtle friction: diminished serendipity, siloed onboarding, and the erosion of spontaneous technical debate.

Waivly emerged to reconcile this tension, introducing an intelligent spatial collaboration engine tailored specifically for distributed engineering organizations.

### Bridging the Distance

Unlike clunky virtual office attempts of previous generations, Waivly focuses on ambient audio fidelity, contextual codebase synchronization, and lightweight presence awareness.

Engineers working on shared repositories can observe real-time spatial clusters representing teammates debugging related microservices or reviewing pull requests. Ambient audio fades smoothly based on workspace proximity, recreating the organic spontaneity of a bustling campus without the fatigue of scheduled meetings.

### The Next Frontier for Distributed Workforces

Companies utilizing Waivly across Ghana, Kenya, and Rwanda report a 40% reduction in ad-hoc sync meetings alongside noticeable improvements in junior developer retention.

By reimagining the fundamentals of professional proximity, Waivly is proving that the future of distributed collaboration is not about mimicking physical cubicles, but inventing deeper ways for ambitious minds to build together.`,
    coverImage: 'https://res.cloudinary.com/djonulqfz/image/upload/v1791812458/techquo/articles/nr4hqfavd6k8ylcyugds.jpg',
    category: 'Innovation',
    authorId: 'auth_3',
    author: AUTHORS['auth_3'],
    publishedAt: 'August 31, 2026',
    readingTime: '6 min read',
    tags: ['RemoteWork', 'SoftwareEngineering', 'FutureOfWork', 'Productivity'],
    status: 'published',
    featured: false,
    likesCount: 0,
    commentsCount: 0,
  },
  {
    id: 'art_4',
    title: 'How Artificial Intelligence Is Transforming Africa\'s Startup Ecosystem',
    slug: 'ai-transforming-africas-startup-ecosystem',
    excerpt: 'From localized multilingual models to autonomous credit underwriting, founders are bypassing legacy enterprise models to build high-impact native AI applications.',
    body: `Across the continent, artificial intelligence has ceased to be an academic novelty or an imported luxury. Instead, African startup founders are deploying localized intelligence models directly into foundational industries: agriculture, financial inclusion, healthcare triage, and distributed supply chains.

### Solving High-Value Foundational Challenges

Unlike Silicon Valley startups focused on generic generative chatbots, African AI enterprises are characterized by rigorous domain specificity.

In Nairobi, agritech platforms use computer vision models running on low-cost smartphones to identify crop disease in smallholder maize fields with over 96% accuracy. In Lagos, fintech startups leverage graph neural networks to assess creditworthiness for millions of informal market traders with no traditional banking footprint.

### Data Sovereignty and Native Language Corpora

A pivotal movement within the ecosystem is the preservation and digitization of indigenous languages. Teams across Dakar, Addis Ababa, and Pretoria are curating high-fidelity datasets in Yoruba, Swahili, Amharic, and Zulu to ensure frontier language models understand localized economic context.

With venture capital increasingly favoring cash-flow resilient, mission-critical AI startups, Africa is poised to demonstrate some of the world's most compelling real-world applications of machine intelligence.`,
    coverImage: 'https://res.cloudinary.com/djonulqfz/image/upload/v1791812460/techquo/articles/ypcphyf0gk2yibqgebmf.jpg',
    category: 'Africa',
    authorId: 'auth_4',
    author: AUTHORS['auth_4'],
    publishedAt: 'August 30, 2026',
    readingTime: '5 min read',
    tags: ['AI', 'Startups', 'Fintech', 'Africa'],
    status: 'published',
    featured: false,
    likesCount: 0,
    commentsCount: 0,
  },
  {
    id: 'art_5',
    title: 'The Cross-Border Liquidity Frontier: Inside Africa\'s Next FinTech Revolution',
    slug: 'cross-border-liquidity-frontier-fintech-revolution',
    excerpt: 'How real-time settlement rails and digital asset corridors are dismantling intra-continental trade barriers faster than international treaties.',
    body: `For decades, sending money between neighbouring African economies required routing funds through intermediary banks in Europe or North America. This archaic paradigm resulted in exorbitant foreign exchange markups, days of settlement delays, and severe capital friction.

Today, a new generation of fintech protocols and interoperable payment rails is radically reshaping intra-African commerce.

By leveraging real-time gross settlement architectures and stable digital currency corridors, modern fintech infrastructure allows an importer in Abidjan to settle invoices with a manufacturer in Kigali within seconds, at a fraction of legacy transaction costs.

As the African Continental Free Trade Area (AfCFTA) gains operational momentum, frictionless cross-border liquidity will serve as the indispensable bedrock of modern continental prosperity.`,
    coverImage: 'https://res.cloudinary.com/djonulqfz/image/upload/v1791812461/techquo/articles/piu7w0hfq6zinzqzndab.jpg',
    category: 'FinTech',
    authorId: 'auth_1',
    author: AUTHORS['auth_1'],
    publishedAt: 'August 28, 2026',
    readingTime: '5 min read',
    tags: ['FinTech', 'Payments', 'Trade', 'Banking'],
    status: 'published',
    featured: false,
    likesCount: 0,
    commentsCount: 0,
  },
  {
    id: 'art_6',
    title: 'Capital Efficiency Over Blitzscaling: The New Playbook for African Founders',
    slug: 'capital-efficiency-new-playbook-african-founders',
    excerpt: 'Venture dynamics have shifted globally. African founders who prioritized unit economics and sustainable revenue from day one are now outperforming their capital-hungry peers.',
    body: `The era of growth-at-all-costs has officially concluded. Across technology hubs from Cairo to Cape Town, venture capitalists and startup operators are aligning around a new paradigm: resilient unit economics, rapid paths to profitability, and operational discipline.

This transition has proven especially beneficial for African founders, who have long had to navigate currency volatility, infrastructure bottlenecks, and macroeconomic turbulence.

Founders who mastered working capital cycles and customer-funded expansion are scaling sustainably without depending on continuous equity injections. The discipline forged during challenging venture climates is quietly cultivating the most durable technology institutions the continent has ever seen.`,
    coverImage: 'https://res.cloudinary.com/djonulqfz/image/upload/v1791812462/techquo/articles/vstiofhuo3isyg0olcmu.jpg',
    category: 'Startups',
    authorId: 'auth_2',
    author: AUTHORS['auth_2'],
    publishedAt: 'August 27, 2026',
    readingTime: '4 min read',
    tags: ['VentureCapital', 'Startups', 'Economics', 'Leadership'],
    status: 'published',
    featured: false,
    likesCount: 0,
    commentsCount: 0,
  },
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    title: 'Featured Story Alert',
    body: 'The Intelligence of Living: How LetPlant is Redefining Climate Tech is now published.',
    category: 'editorial',
    timestamp: '15m ago',
    read: false,
    articleId: 'art_1',
  },
  {
    id: 'notif_2',
    title: 'Trending in FinTech',
    body: 'The Cross-Border Liquidity Frontier is gaining widespread readership across West Africa.',
    category: 'trending',
    timestamp: '2h ago',
    read: false,
    articleId: 'art_5',
  },
  {
    id: 'notif_3',
    title: 'Weekly TechQuo Executive Brief',
    body: 'Your curated digest on AI infrastructure, African venture capital, and sovereign creator platforms.',
    category: 'editorial',
    timestamp: '1d ago',
    read: false,
  },
  {
    id: 'notif_4',
    title: 'Category Update: Startups',
    body: 'Capital Efficiency Over Blitzscaling: The New Playbook for African Founders is now live.',
    category: 'followed',
    timestamp: '2d ago',
    read: true,
    articleId: 'art_6',
  },
];

export const MOCK_COMMENTS: Comment[] = [];
