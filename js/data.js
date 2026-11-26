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
      name: "FoodCopycat.com",
      website: "https://foodcopycat.com/",
      workCompleted: [
        "Local SEO & On-Page SEO",
        "Technical SEO",
        "Off-Page SEO",
        "Keyword & Content Optimization",
        "Blog Writing & Link Building"
      ],
      duration: "August 2025 – Present",
      domainAge: "Launched in August 2025",
      overview: "FoodCopycat.com is a blogging website focused on Copycat recipes and cooking tips. The website aims to provide valuable, high-quality content to its audience while improving organic search visibility and user engagement. Since its launch in August 2025, the site has focused on delivering informative and engaging content that ranks well on Google and keeps users coming back.",
      targetKeywords: [
        "Omakase Sauce",
        "Cajun Burger",
        "KFC Stacker sauce"
      ],
      objectives: [
        "Improve organic traffic and search visibility.",
        "Enhance user engagement and session duration.",
        "Optimize content for better reach and relevance.",
        "Increase search engine rankings for targeted keywords."
      ],
      contributions: [
        {
          title: "Local SEO & On-Page SEO",
          intro: "To establish FoodCopycat.com as a reliable resource in its niche, we implemented a targeted SEO strategy:",
          items: [
            {
              label: "Keyword Optimization",
              detail: "Identified high-traffic keywords like “Omakase Sauce”, “Cajun Burger”, and “KFC Stacker sauce”, integrating them into blog posts, meta descriptions, and service pages."
            },
            {
              label: "Content Optimization",
              detail: "Improved existing articles and created new high-quality content to satisfy user intent and increase search relevance, including optimized meta tags and structured data implementation."
            },
            {
              label: "Technical SEO",
              detail: "Optimized website structure, Google Search Console setup, site speed, mobile responsiveness, and implemented structured data."
            },
            {
              label: "Review & Engagement Signals",
              detail: "Monitored user behavior to improve internal linking, readability, and session duration."
            }
          ],
          result: "Organic traffic grew steadily, and multiple blog posts ranked on Google’s first page for targeted and long-tail keywords."
        },
        {
          title: "Off-Page SEO",
          intro: "To enhance domain authority and overall visibility:",
          items: [
            {
              label: "Link Building",
              detail: "Built high-quality backlinks from relevant and authoritative websites."
            },
            {
              label: "Outreach",
              detail: "Collaborated with influencers and websites in the niche to improve traffic and referral links."
            },
            {
              label: "Content Marketing",
              detail: "Promoted blog content across social media and online platforms to drive engagement and build credibility."
            }
          ],
          result: "The website achieved better keyword rankings and increased impressions in search results, improving overall visibility."
        }
      ],
      results: [
        "Traffic Growth: Organic traffic has shown consistent growth since the website launch through regular content publishing and SEO optimization.",
        "Keyword Rankings: Multiple blog posts appeared on Google’s first page for targeted and long-tail keywords within a short time period.",
        "Overall Keyword Visibility: Overall keyword visibility improved, helping the website gain better impressions in search results.",
        "User Engagement: Session duration improved and bounce rate decreased due to enhanced content structure, readability, better internal linking, and improved page experience.",
        "Content Authority: Built credibility in the niche through high-quality blogs and backlinks."
      ],
      impactSummary: "By applying a comprehensive SEO strategy and combining technical expertise with content optimization, we helped FoodCopycat.com grow into a competitive and authoritative resource in its niche.",
      analyticsMetrics: {
        source: "Google Analytics & Search Performance",
        kpis: [
          { label: "Total Impressions", value: "17K", change: "↑ 226.1%" },
          { label: "Total Clicks", value: "78", change: "↑ 143.8%" },
          { label: "Unique Visitors from Search", value: "128", change: "↑ 106.5%" }
        ]
      },
      pagespeed: {
        device: "Mobile",
        scores: [
          { label: "Performance", score: 96 },
          { label: "Accessibility", score: 91 },
          { label: "Best Practices", score: 96 },
          { label: "SEO", score: 92 }
        ]
      },
      toolsUsed: [
        {
          group: "Analytics and Monitoring",
          tools: ["Google Analytics", "Google Search Console", "Google Site Kit"]
        },
        {
          group: "SEO Tools",
          tools: ["SEMrush", "Ubersuggest", "Keyword Surfer"]
        }
      ],
      images: [
        "/uploads/file-1787648456689-603532847.png"
      ]
    },
    {
      id: "66-marketings",
      name: "66marketings.com",
      website: "https://66marketings.com/",
      workCompleted: [
        "On-Page SEO & Local Optimization",
        "Off-Page SEO",
        "Technical SEO",
        "Content Optimization",
        "Backlink Building & Outreach"
      ],
      duration: "December 2023 – August 2024",
      overview: "66marketings.com is an e-commerce agency website that offers digital marketing solutions to businesses seeking to improve their online presence. From December 2023 to August 2024, the website focused on attracting relevant traffic, improving search visibility, and providing a seamless experience for users looking for marketing services.",
      objectives: [
        "Attract relevant organic traffic and improve search engine visibility for digital marketing service offerings.",
        "Identify high-traffic, relevant keywords and integrate them into service pages, blog posts, and meta descriptions.",
        "Optimize website structure, internal linking, mobile responsiveness, and site speed for better search performance.",
        "Strengthen domain authority through high-quality backlinks, content outreach, and off-page SEO campaigns."
      ],
      contributions: [
        {
          title: "On-Page SEO & Local Optimization",
          intro: "To enhance 66marketings.com’s visibility in search engines, we implemented a targeted on-page SEO strategy:",
          items: [
            {
              label: "Keyword Optimization",
              detail: "Identified high-traffic and relevant keywords and integrated them into service pages, blog posts, and meta descriptions."
            },
            {
              label: "Content Optimization",
              detail: "Improved existing website content and created high-quality SEO-friendly blogs to address user intent."
            },
            {
              label: "Technical SEO",
              detail: "Optimized website structure, internal linking, mobile responsiveness, and site speed for better search performance."
            }
          ],
          result: "Organic traffic grew consistently, and key service pages began ranking higher for targeted keywords."
        },
        {
          title: "Off-Page SEO",
          intro: "To strengthen the website’s authority and improve rankings:",
          items: [
            {
              label: "Backlink Building",
              detail: "Acquired high-quality and relevant backlinks from authoritative sources in the marketing niche."
            },
            {
              label: "Content Outreach",
              detail: "Promoted blog posts and website content to relevant platforms to attract referral traffic."
            },
            {
              label: "SEO Campaigns",
              detail: "Implemented off-page strategies to enhance domain authority and improve search visibility."
            }
          ],
          result: "Keyword rankings improved, domain authority increased, and the website gained more impressions in search results."
        }
      ],
      results: [
        "Traffic Growth: Organic traffic increased steadily due to optimized content and consistent SEO practices.",
        "Keyword Rankings: Multiple blogs and service pages ranked on Google’s first page for targeted keywords.",
        "User Engagement: Session duration improved and bounce rate decreased through better content structure and readability.",
        "Domain Authority: High-quality backlinks and off-page strategies strengthened the website’s credibility."
      ],
      impactSummary: "By combining on-page optimization, content creation, and off-page SEO strategies, we helped 66marketings.com grow its digital presence and establish itself as a competitive e-commerce agency in the digital marketing space.",
      analyticsMetrics: {
        source: "Google Search Console (07/05/2024 – 28/05/2024)",
        kpis: [
          { label: "Total Clicks", value: "269" },
          { label: "Total Impressions", value: "7.92K" },
          { label: "Average CTR", value: "3.4%" },
          { label: "Average Position", value: "14.3" }
        ]
      },
      images: []
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
