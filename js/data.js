// Portfolio Data Object
// Structure:
// - seoProjects: Main case studies
// - freelanceProjects: Local citations & business listing projects
// - wordpressProjects: Coming soon placeholders
// - socialProjects: Coming soon placeholders

const portfolioData = {
  seoProjects: [
    {
      id: "food-copycat",
      name: "Food Copycat",
      website: "https://foodcopycat.com/",
      workCompleted: [
        "Complete On-Page SEO",
        "Complete Off-Page SEO",
        "Technical SEO",
        "Blog Writing"
      ],
      duration: "4 Months",
      objectives: [
        "Improve the website's overall search engine optimization performance and indexing.",
        "Optimize on-page elements, internal link structure, and overall technical site health.",
        "Strengthen the website's backlink profile and domain authority through safe off-page SEO.",
        "Publish SEO-focused blog content targeting high-intent, relevant search queries."
      ],
      results: [
        "Improved overall website SEO structure and on-page optimization scores.",
        "Stronger off-page authority profile and high-quality backlink acquisitions.",
        "Increased organic search visibility and rankings potential through optimized content."
      ]
    },
    {
      id: "66-marketings",
      name: "66 Marketings",
      website: "https://66marketings.com/",
      workCompleted: [
        "On-Page SEO",
        "Backlink Building"
      ],
      duration: "3 Months",
      objectives: [
        "Analyze and improve on-page SEO elements for core landing pages.",
        "Optimize website content copy and metadata structure for primary target terms.",
        "Build relevant backlinks to strengthen domain authority and drive search engine crawlers."
      ],
      results: [
        "Enhanced on-page search engine compatibility and metadata health.",
        "Stronger and more relevant backlink profile targeting niche terms.",
        "Established a solid SEO foundation for long-term ranking growth."
      ]
    },
    {
      id: "campagne-sms",
      name: "Campagne SMS",
      website: "https://campagnesms.com/",
      workCompleted: [
        "Complete Off-Page SEO",
        "Backlink Building",
        "French Website SEO"
      ],
      duration: "5 Months",
      objectives: [
        "Improve off-page SEO signals tailored to a French-speaking target market.",
        "Build relevant and authoritative backlinks from French and regional websites.",
        "Strengthen the website's external trust signals and search engine validation.",
        "Improve overall organic search visibility in regional search engine layouts."
      ],
      results: [
        "Improved off-page SEO foundation targeting local search nodes.",
        "Acquired a portfolio of highly relevant, language-specific backlinks.",
        "Stronger external website authority metrics and digital footprints."
      ]
    },
    {
      id: "auto-wert-direkt",
      name: "Auto Wert Direkt",
      website: "https://auto-wert-direkt.de/",
      workCompleted: [
        "Complete Technical SEO Setup",
        "On-Page SEO",
        "Off-Page SEO"
      ],
      duration: "3 Months",
      objectives: [
        "Create a solid technical SEO foundation for correct indexing and crawlability.",
        "Improve on-page SEO components, schemas, and page loading performance.",
        "Identify and resolve important technical SEO errors, including crawl budget bottlenecks.",
        "Build relevant domain backlinks through high-quality off-page outreach campaigns."
      ],
      results: [
        "Resolved indexing errors and completed technical site optimization.",
        "Better on-page metadata optimization and site architecture.",
        "Stronger off-page SEO profile with improved authority indicators."
      ]
    },
    {
      id: "cyta-tech",
      name: "Cyta Tech",
      website: "https://cyta-tech.vercel.app/",
      workCompleted: [
        "Blog Writing",
        "Off-Page SEO"
      ],
      duration: "4 Months",
      objectives: [
        "Create high-quality, SEO-focused blog content that resolves user intent.",
        "Improve topic authority and content depth across tech-focused subjects.",
        "Build authority backlinks to boost off-page SEO signals and trust.",
        "Support long-term organic growth by positioning the blog for informational queries."
      ],
      results: [
        "Consistent publication of high-value, SEO-targeted content.",
        "Expanded search footprint through new keyword indexings.",
        "Stronger backlink and authority framework."
      ]
    },
    {
      id: "salt-mud",
      name: "Salt & Mud",
      website: "https://www.saltandmud.com/",
      workCompleted: [
        "Off-Page SEO",
        "Niche-Relevant Backlink Building"
      ],
      duration: "3 Months",
      objectives: [
        "Acquire highly relevant, niche-specific backlinks in the wellness/beauty space.",
        "Improve the brand's off-page SEO profile and search engine trust signals.",
        "Strengthen domain authority through high-quality contextual links and mentions."
      ],
      results: [
        "Improved quality and relevance of the external backlink profile.",
        "Stronger off-page SEO positioning against competitor sites.",
        "Increased trust signals from authoritative niche domains."
      ]
    },
    {
      id: "heartspace-publications",
      name: "Heartspace Publications",
      website: "https://heartspacepublications.com/",
      workCompleted: [
        "Blog Writing",
        "Off-Page SEO"
      ],
      duration: "4 Months",
      objectives: [
        "Develop search-optimized, engaging blog content aligned with the publication's brand.",
        "Improve organic keyword coverage and build topical search clusters.",
        "Acquire high-quality backlinks from niche-relevant writing and publisher networks.",
        "Support organic search discoverability through blog posts and off-page efforts."
      ],
      results: [
        "Improved content presence and structured blog indexation.",
        "Consistent publication of keyword-mapped articles.",
        "Developed a more resilient off-page SEO and digital footprint."
      ]
    },
    {
      id: "usa-nova-glow",
      name: "USA Nova Glow",
      website: "https://usanovaglow.com/",
      workCompleted: [
        "Shopify Store SEO"
      ],
      duration: "1 Month",
      objectives: [
        "Optimize the Shopify e-commerce architecture for better search indexing.",
        "Improve product pages, collection page metadata, and header tag structures.",
        "Strengthen the online store's crawl health and user-experience signals.",
        "Boost organic visibility for key transactional queries and product lines."
      ],
      results: [
        "Optimized Shopify store settings, metadata, and site hierarchy.",
        "Enhanced product and catalog-level on-page SEO targeting key buyer terms.",
        "Established a solid SEO framework for retail visibility."
      ]
    },
    {
      id: "khaleej-tip",
      name: "Khaleej Tip",
      website: "https://khaleejtip.com/",
      workCompleted: [
        "Off-Page SEO",
        "Backlink Building"
      ],
      duration: "5 Months",
      objectives: [
        "Strengthen off-page SEO signals and enhance search domain reputation.",
        "Build secure, natural backlinks from authority platforms in regional domains.",
        "Improve regional visibility and digital signals in organic searches.",
        "Support organic ranking improvements for competitive local target terms."
      ],
      results: [
        "Robust backlink profile with diverse anchor texts.",
        "Stronger off-page SEO performance and authority footprint.",
        "Improved baseline regional search authority metrics."
      ]
    }
  ],

  freelanceProjects: [
    {
      id: "encharge-capital",
      name: "Encharge Capital",
      website: "https://enchargecapital.com.au/",
      workCompleted: [
        "Niche-Relevant Business Listings"
      ],
      duration: "3 Months",
      objectives: [
        "Create authoritative business listings and citations across financial directories.",
        "Improve local search prominence and visibility for geo-specific financial queries.",
        "Ensure consistent Name, Address, and Phone number (NAP) data across online platforms."
      ],
      results: [
        "Expanded business citation network in regional directories.",
        "Achieved NAP information alignment across key listings.",
        "Stronger foundation for regional and local search engine visibility."
      ]
    },
    {
      id: "hire-a-painter",
      name: "Hire A Painter",
      website: "https://hireapainter.com/",
      workCompleted: [
        "Niche-Relevant Business Listings"
      ],
      duration: "4 Months",
      objectives: [
        "Build niche-relevant business listings and directories focused on home services.",
        "Improve local discoverability of painters and home restoration offerings.",
        "Strengthen localized authority and citation metrics for search crawlers."
      ],
      results: [
        "Enhanced local index presence via structured service citations.",
        "More consistent business footprint in home improvement catalogs.",
        "Better local authority foundation for map-pack positioning."
      ]
    },
    {
      id: "urban-contractors-nyc",
      name: "Urban Contractors NYC",
      website: "https://www.urbancontractorsnyc.com/",
      workCompleted: [
        "Niche-Relevant Business Listings"
      ],
      duration: "3 Months",
      objectives: [
        "Establish business listings in contractor and construction directories in NYC.",
        "Ensure consistent local NAP presence across premium city search directories.",
        "Support local SEO performance through hyper-localized citation signals."
      ],
      results: [
        "Created an organized local listing network across contractors' nodes.",
        "Strengthened local search authority for contracting queries in target regions.",
        "Reinforced NAP consistency across primary online maps and indexes."
      ]
    },
    {
      id: "lenehans-bar",
      name: "Lenehans Bar",
      website: "https://lenehansbar.com/",
      workCompleted: [
        "Social Profile Backlinks"
      ],
      duration: "3 Months",
      objectives: [
        "Create relevant and authoritative social profile listings pointing to the site.",
        "Improve off-page presence and brand signals across entertainment portals.",
        "Strengthen overall search engine confidence through natural, diversified link sources."
      ],
      results: [
        "Established a clean, interconnected social and brand citation profile.",
        "Diversified the incoming link profile with trusted social domains.",
        "Built a resilient off-page digital reputation foundation."
      ]
    }
  ],

  wordpressProjects: [
    {
      id: "wp-auto-wert-direkt",
      name: "Auto Wert Direkt",
      description: "A complete used-car selling website designed with a detailed multi-page structure and a dedicated car evaluation form.",
      workCompleted: [
        "Complete WordPress website design",
        "Multi-page website structure",
        "Custom car evaluation form",
        "Responsive UI",
        "User-friendly website layout"
      ],
      technology: "WordPress • Elementor Pro",
      highlight: "Designed a detailed 4-page website with a custom car evaluation form for the used-car selling business."
    },
    {
      id: "wp-builder-haus",
      name: "Builder Haus",
      description: "A custom WordPress website designed completely from scratch for a professional construction/business brand.",
      workCompleted: [
        "Complete website design",
        "Custom layout from scratch",
        "Responsive design",
        "UI/UX structure",
        "Page customization"
      ],
      technology: "WordPress • Elementor Pro",
      highlight: "Built the website completely from scratch using Elementor Pro with a custom responsive layout."
    },
    {
      id: "wp-keywordly",
      name: "Keywordly",
      description: "A custom website designed from scratch with a clean and modern digital-product style interface.",
      workCompleted: [
        "Complete website design",
        "Custom page layouts",
        "Responsive design",
        "UI/UX design",
        "Website structure"
      ],
      technology: "WordPress • Elementor Pro",
      highlight: "Designed the complete website from scratch using Elementor Pro."
    },
    {
      id: "wp-agentech",
      name: "Agentech",
      description: "A custom dummy website template designed from scratch with a modern technology-focused visual style.",
      workCompleted: [
        "Website design",
        "Custom layout",
        "Responsive UI",
        "Modern interface design",
        "Template development"
      ],
      technology: "WordPress • Elementor Pro",
      highlight: "Created a modern technology-focused website template completely from scratch."
    }
  ],

  aiProjects: [
    {
      id: "ai-qatar-market",
      name: "Qatar Market",
      description: "A classifieds/ads marketplace website developed for the Qatar market. The project includes a complete frontend and backend architecture for publishing and managing advertisements.",
      workCompleted: [
        "Frontend development",
        "Backend development",
        "Ads posting functionality",
        "Marketplace structure",
        "Responsive website interface"
      ],
      technology: "Next.js • HTML • CSS • JavaScript",
      highlight: "Developed a complete ads marketplace website with a custom frontend and backend architecture."
    },
    {
      id: "ai-blog-pilot",
      name: "Blog Pilot",
      description: "A software project designed to introduce automated blog publishing and content management for WordPress websites.",
      workCompleted: [
        "Blog automation concept",
        "WordPress integration",
        "Automated content publishing workflow",
        "Software interface development",
        "Website automation functionality"
      ],
      technology: "WordPress • Blog Automation • AI-powered workflow",
      highlight: "Developed a blog automation solution designed to streamline content publishing for WordPress websites."
    }
  ],
  
  testimonials: [
    {
      name: "Ahsan Raza",
      role: "Business Owner",
      text: "Working with Saba was a great experience. She understood the SEO requirements quickly and delivered the work professionally.",
      rating: 5
    },
    {
      name: "Hira Ahmed",
      role: "Website Owner",
      text: "Saba helped improve the structure and SEO of our website and was very consistent with the work throughout the project.",
      rating: 5
    },
    {
      name: "Usman Khalid",
      role: "Digital Business Owner",
      text: "Very professional approach and good attention to detail. The website and SEO work was handled exactly according to the requirements.",
      rating: 5
    },
    {
      name: "Maham Shah",
      role: "Business Owner",
      text: "I really liked the clean website design and the communication throughout the project. The overall experience was smooth and professional.",
      rating: 5
    },
    {
      name: "Hamza Ali",
      role: "Startup Founder",
      text: "Saba worked on both the website and SEO requirements with a very organized approach. The final work looked clean and professional.",
      rating: 5
    }
  ],

  faqs: [
    {
      question: "What SEO services do you provide?",
      answer: "I provide on-page SEO, technical SEO, off-page SEO, backlink building, content optimization, blog writing and other website optimization services."
    },
    {
      question: "Do you build WordPress websites from scratch?",
      answer: "Yes. I can design and build custom WordPress websites from scratch, including responsive layouts and Elementor Pro-based website development."
    },
    {
      question: "Can you work on an existing website?",
      answer: "Yes. I can work on existing websites for SEO optimization, website improvements, content updates, technical SEO and design modifications."
    },
    {
      question: "How long does an SEO project take?",
      answer: "The timeline depends on the website, competition and project requirements. SEO projects can range from a few months to longer-term ongoing optimization."
    },
    {
      question: "Do you provide blog writing services?",
      answer: "Yes. I can create SEO-focused blog content based on relevant topics and search intent, with content structured to support organic visibility."
    },
    {
      question: "Can you manage social media marketing projects?",
      answer: "Yes. I also work on social media marketing, content planning, social media management and digital advertising content."
    }
  ],

  socialProjects: []
};

// Make it globally accessible
window.portfolioData = portfolioData;
