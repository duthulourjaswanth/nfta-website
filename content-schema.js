/**
 * content-schema.js
 *
 * DEFAULT_CONTENT — every editable piece of copy/image/price/link on the
 * site, lifted from the current hand-written HTML. This is what a visitor
 * sees when Firestore has nothing (or is unreachable): the site must render
 * identically to the pre-CMS version from these defaults alone.
 *
 * mergeContent(defaults, stored) deep-merges a partial Firestore document
 * over these defaults, so any field the client hasn't touched yet — or any
 * field added to this file after the client already has a saved document —
 * still renders correctly instead of showing blank/undefined.
 *
 * Field paths below use the same dot notation as the data-cms attributes,
 * e.g. data-cms="text:home.hero.sub" reads DEFAULT_CONTENT.home.hero.sub.
 */

export const DEFAULT_CONTENT = {
  // ===========================================================
  // SITE — shared across every page (nav, footer, contact info)
  // ===========================================================
  site: {
    brand: {
      name: 'NFTA'
    },
    contact: {
      email: 'nftaacademy@gmail.com',
      phoneDisplay: '090083 43579',
      phoneHref: '09008343579',        // digits used in tel: links
      whatsapp: '919008343579',        // digits used in wa.me links (country code + number)
      facebook: 'https://www.facebook.com/NFTA.Academy',
      instagram: 'https://instagram.com/nfta.academy'
    },
    nav: {
      ctaLabel: 'Contact Us'
    },
    footer: {
      tagline: 'Train to coach. Built on science, not shortcuts.',
      copyright: '© 2026 NFTA — Nutrition and Fitness Trainers Alliance.',
      tagline2: 'Built on science. Made to coach.'
    }
  },

  // ===========================================================
  // HOME — index.html
  // ===========================================================
  home: {
    seo: {
      title: "NFTA | India's Premier Personal Trainer Academy & Fitness Certifications",
      description: "Advance your career with NFTA, India's leading personal trainer academy. Get certified as a fitness trainer, nutrition coach, or contest prep specialist with science-backed courses."
    },
    hero: {
      show: true,
      eyebrow: "India's Premier Personal Trainer Academy",
      titlePre: 'Become The',
      titleAccent: 'Coach',
      titlePost: 'They Trust',
      sub: "A career in fitness takes more than a certificate — it takes real skill. NFTA trains personal trainers, nutritionists, and contest-prep coaches through science-backed certifications, led by an International Master Trainer.",
      ctaPrimaryLabel: 'Enquire Now',
      ctaPrimaryLink: 'contact.html',
      ctaSecondaryLabel: 'Browse Courses',
      ctaSecondaryLink: 'courses.html',
      stats: [
        { id: 'stat1', value: '2500+', label: 'Trainers certified' },
        { id: 'stat2', value: '2007', label: 'Coaching since' },
        { id: 'stat3', value: '3', label: 'Certifications' }
      ],
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80&auto=format&fit=crop',
      badgeTitle: 'Founder-led',
      badgeSub: 'by Intl. Master Trainer "Sharu"'
    },
    marquee: {
      show: true,
      items: [
        { id: 'm1', text: 'Since 2007' },
        { id: 'm2', text: '2500+ Trainers Certified' },
        { id: 'm3', text: 'Science-Backed Curriculum' },
        { id: 'm4', text: 'Online · Offline · Hybrid' },
        { id: 'm5', text: 'Founder-Led' },
        { id: 'm6', text: '3 Certifications' }
      ]
    },
    science: {
      show: true,
      headingPre: 'Where',
      headingAccent: 'Science',
      headingSuffix: 'Is Applied',
      lead: "Most fitness education stops at \"here's the muscle, here's the exercise.\" NFTA goes further: into <em>why</em> a movement works, how to adjust it for a real client in front of you, and what to do when the textbook answer doesn't fit the person you're training.",
      images: [
        { id: 'img1', src: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80&auto=format&fit=crop', alt: 'Athlete training with weights' },
        { id: 'img2', src: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=700&q=80&auto=format&fit=crop', alt: 'Strength coaching session' },
        { id: 'img3', src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=700&q=80&auto=format&fit=crop', alt: 'Trainer demonstrating a lift' }
      ],
      points: [
        { id: 'p1', title: 'Case-based correction.', body: "Spot and fix form errors the way you'll actually meet them: mid-session, under pressure." },
        { id: 'p2', title: 'Applied program design.', body: 'Build around real constraints: injury history, time limits, conflicting goals.' },
        { id: 'p3', title: 'Evidence over trends.', body: "Nutrition and coaching grounded in what holds up, not what's viral this week." }
      ]
    },
    programs: {
      show: true,
      headingPre: 'Certification',
      headingAccent: 'Programs',
      sub: 'Every NFTA certification is built to do one thing: prepare you to actually coach — not just pass a test. Pick the path that matches where you want your career to go.',
      cards: [
        { id: 'c1', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=700&q=80&auto=format&fit=crop', title: 'Certified Personal Trainer', desc: 'Exercise science, movement, and client programming that holds up outside the classroom.', link: 'courses-personal-trainer.html', tag: '' },
        { id: 'c2', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=700&q=80&auto=format&fit=crop', title: 'Weight Loss Nutritionist', desc: 'Coach nutrition with evidence, not fads — for clients who need results, not trends.', link: 'courses-weight-loss-nutritionist.html', tag: '' },
        { id: 'c3', image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=700&q=80&auto=format&fit=crop', title: 'Contest-Prep & Transformation', desc: 'Competition-day programming, posing, and peak-week protocols for physique athletes.', link: 'courses-contest-prep.html', tag: '' },
        { id: 'c4', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=700&q=80&auto=format&fit=crop', title: 'Personal Yoga Trainer', desc: 'A practical yoga certification for coaches who want to teach with real understanding.', link: '', tag: 'Launching soon' }
      ]
    },
    founder: {
      show: true,
      headingPre: 'Meet The',
      headingAccent: 'Founder',
      lead: 'NFTA is led by a working professional — not a name licensed to a curriculum he doesn\'t oversee. Sharu still coaches real clients and competes at a professional level.',
      photo: 'assets/img/founder-sharu.jpg',
      name: '"Sharu" Saravanan Hariram',
      role: 'Founder & Chief Training Officer',
      creds: 'ACE-PT · CHFT · CSN · PY-T',
      bio: 'International Master Trainer, Sports Nutritionist, and International Bodybuilder. Since 2007 he has certified <b>2,500+ trainers</b>, applying competition and coaching expertise directly to how the curriculum is taught.',
      points: [
        { id: 'w1', text: 'Taught by practitioners, not just instructors' },
        { id: 'w2', text: 'Certifications that hold up in the real world' },
        { id: 'w3', text: 'Learn on your schedule — online, offline, hybrid' },
        { id: 'w4', text: 'A track record you can verify' }
      ],
      ctaLabel: 'Book a Free Counseling Call',
      ctaLink: 'contact.html'
    },
    pricing: {
      show: true,
      headingPre: 'Choose Your',
      headingAccent: 'Path',
      sub: 'Transparent pricing. Applied, career-ready certifications — online, offline, or hybrid.',
      plans: [
        {
          id: 'plan-pt', title: 'Certified Personal Trainer', price: '₹30,000', priceNote: '12-week course · International standard',
          badge: '', featured: false,
          features: [
            { id: 'f1', text: 'Exercise science & biomechanics' },
            { id: 'f2', text: 'Program design & periodization' },
            { id: 'f3', text: 'Client assessment & correction' },
            { id: 'f4', text: 'Coaching & communication skills' },
            { id: 'f5', text: 'Online / offline / hybrid formats' }
          ],
          ctaLabel: 'Enroll Now', ctaLink: 'contact.html'
        },
        {
          id: 'plan-wl', title: 'Weight Loss Nutritionist', price: '₹40,000', priceNote: '4-month course · 24 modules',
          badge: 'Most Popular', featured: true,
          features: [
            { id: 'f1', text: 'Metabolic & weight-management science' },
            { id: 'f2', text: 'Meal planning for real client behavior' },
            { id: 'f3', text: 'Coaching psychology & behavior change' },
            { id: 'f4', text: 'Plateau management' },
            { id: 'f5', text: 'Medical & hormonal conditions' }
          ],
          ctaLabel: 'Enroll Now', ctaLink: 'contact.html'
        },
        {
          id: 'plan-cp', title: 'Contest-Prep & Transformation', price: 'Enquire', priceNote: 'Speciality physique certification',
          badge: '', featured: false,
          features: [
            { id: 'f1', text: 'Off-season & contest-prep programming' },
            { id: 'f2', text: 'Peak-week protocols' },
            { id: 'f3', text: 'Posing & presentation coaching' },
            { id: 'f4', text: 'Body composition & physique assessment' },
            { id: 'f5', text: 'Taught by an International Bodybuilder' }
          ],
          ctaLabel: 'View Details', ctaLink: 'courses-contest-prep.html'
        }
      ]
    },
    ctaBanner: {
      show: true,
      text: 'Start Your Fitness Career',
      ctaLabel: 'Enquire Now',
      ctaLink: 'contact.html'
    },
    contact: {
      show: true,
      headingPre: 'Get In',
      headingAccent: 'Touch',
      lead: "Have a question about which certification is right for you? Reach out — we'll help you figure out the right path before you enroll."
    }
  },

  // ===========================================================
  // ABOUT — about.html
  // ===========================================================
  about: {
    seo: {
      title: 'About NFTA – Nutrition and Fitness Trainers Alliance',
      description: 'Learn about NFTA (Nutrition and Fitness Trainers Alliance), founded by Saravanan "Sharu" Hariram, offering certified training in fitness, nutrition, and contest prep.'
    },
    hero: {
      show: true,
      bgImage: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1600&q=80&auto=format&fit=crop',
      eyebrow: 'Nutrition & Fitness Trainers Alliance',
      titlePre: 'About',
      titleAccent: 'NFTA',
      sub: 'Built on a simple idea: certification should mean you can actually coach — not just that you passed a test.'
    },
    story: {
      show: true,
      headingPre: 'Our',
      headingAccent: 'Story',
      image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=800&q=80&auto=format&fit=crop',
      lead: 'NFTA was founded in 2023 by Saravanan "Sharu" Hariram — a trainer, sports nutritionist, and competitive bodybuilder who saw a gap in Indian fitness education: too many certifications taught theory disconnected from what coaching a real client actually requires.',
      body: 'NFTA was built to close that gap — combining scientific grounding with the applied, hands-on skill that coaching demands. The journey started earlier, in 2007, when Sharu began certifying trainers in South India; since then he has empowered <b>2,500+ trainers</b> to build real careers in a fast-evolving industry.'
    },
    founderFeature: {
      show: true,
      photo: 'assets/img/founder-sharu.jpg',
      badge: 'International Master Trainer',
      eyebrow: 'About the Founder & Trainer',
      name: '"Sharu" Saravanan Hariram',
      role: 'Founder & Chief Training Officer · Sports Nutritionist · International Bodybuilder',
      bio1: 'In <b>2007</b>, a certification course for trainers was initiated in South India by International Master Trainer and Sports Nutritionist "Sharu" Saravanan Hariram — with an objective to give students a solid understanding of the scientific principles related to fitness. He strongly believed that incorporating scientific knowledge into training programs is crucial for their effectiveness, because a structured educational program enables individuals to responsibly pursue their fitness and science-integrated goals.',
      bio2: 'So far, through his Certified Fitness Trainer course, he has empowered more than <b>2,500 trainers</b> and fitness enthusiasts to excel in the ever-evolving fitness industry — competent professionals who demonstrate their grasp of both the theoretical and practical aspects of fitness.',
      creds: [
        { id: 'cr1', text: 'ACE-PT' },
        { id: 'cr2', text: 'CHFT' },
        { id: 'cr3', text: 'CSN' },
        { id: 'cr4', text: 'PY-T' }
      ],
      ctaLabel: 'Browse Our Courses',
      ctaLink: 'courses.html'
    },
    visionMission: {
      show: true,
      visionTitlePre: 'Our',
      visionTitleAccent: 'Vision',
      visionBody: "To be India's most trusted training body for fitness, nutrition, and physique coaching — producing certified professionals who are genuinely equipped to coach, not just credentialed to claim they can.",
      missionTitlePre: 'Our',
      missionTitleAccent: 'Mission',
      missionBody: 'To deliver applied, science-grounded training in fitness, nutrition, and contest-prep coaching — built on integrity, practical skill, and real coaching outcomes.'
    },
    values: {
      show: true,
      headingPre: 'Our',
      headingAccent: 'Values',
      items: [
        { id: 'v1', title: 'Integrity in education', body: 'No overstated claims, no shortcuts in the curriculum. What we teach is what holds up in the field.' },
        { id: 'v2', title: 'Applied over theoretical', body: 'Every module is built to be usable in an actual coaching session — not just recited in an interview.' },
        { id: 'v3', title: 'Founder-led standards', body: 'Sharu stays directly involved in shaping the curriculum — the standards are set by someone still doing the work.' }
      ]
    },
    cta: {
      show: true,
      heading: 'Ready To Begin?',
      ctaLabel: 'Contact Us to Begin',
      ctaLink: 'contact.html'
    }
  },

  // ===========================================================
  // COURSES — courses.html (listing)
  // ===========================================================
  courses: {
    seo: {
      title: 'Fitness Certification Courses in India | NFTA',
      description: "Explore NFTA's fitness certification courses — personal trainer, nutrition, and contest-prep & body transformation programs. Certified, practical, career-ready."
    },
    hero: {
      show: true,
      bgImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80&auto=format&fit=crop',
      eyebrow: 'Certification Programs',
      titlePre: 'Choose Your',
      titleAccent: 'Path',
      sub: 'Every NFTA certification is built to do one thing: prepare you to actually coach — not just pass a test. Pick the path that matches where you want your career to go.'
    },
    list: {
      show: true,
      items: [
        {
          id: 'row-pt',
          image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80&auto=format&fit=crop',
          tag: '12-week course · International standard',
          title: 'Certified Personal Trainer',
          desc: "This isn't a course that teaches you to count reps. It trains you to assess a client, design a program around their actual limitations, and adjust it when the plan meets reality.",
          learn: [
            { id: 'l1', text: 'Anatomy, physiology & movement mechanics' },
            { id: 'l2', text: 'Program design & periodization' },
            { id: 'l3', text: 'Client assessment & correction' },
            { id: 'l4', text: 'Communication & coaching skills' }
          ],
          price: '₹30,000', priceNote: '12 weeks · online / offline / hybrid',
          detailLink: 'courses-personal-trainer.html', enrollLink: 'contact.html', enrollLabel: 'Enroll now →'
        },
        {
          id: 'row-wl',
          image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80&auto=format&fit=crop',
          tag: '4-month course · 24 modules',
          title: 'Certified Weight Loss Nutritionist',
          desc: "Weight loss advice is everywhere, and most of it doesn't hold up past week two. Learn to build sustainable, evidence-based strategies — and coach clients through the part that actually determines results: staying consistent.",
          learn: [
            { id: 'l1', text: 'Metabolic & weight-management science' },
            { id: 'l2', text: 'Meal planning for real client behavior' },
            { id: 'l3', text: 'Coaching psychology & behavior change' },
            { id: 'l4', text: 'Plateau & medical/hormonal conditions' }
          ],
          price: '₹40,000', priceNote: '4 months · online / offline / hybrid',
          detailLink: 'courses-weight-loss-nutritionist.html', enrollLink: 'contact.html', enrollLabel: 'Enroll now →'
        },
        {
          id: 'row-cp',
          image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80&auto=format&fit=crop',
          tag: 'Speciality certification',
          title: 'Contest-Prep & Body Transformation Expert',
          desc: 'Coaching a physique athlete through competition prep is a different skill from general personal training — different timelines, different stakes, no room for guesswork. Learn to coach that process from off-season through peak week.',
          learn: [
            { id: 'l1', text: 'Off-season & contest-prep programming' },
            { id: 'l2', text: 'Peak-week protocols' },
            { id: 'l3', text: 'Posing & presentation coaching' },
            { id: 'l4', text: 'Body composition & physique assessment' }
          ],
          price: 'Enquire', priceNote: 'taught by an International Bodybuilder',
          detailLink: 'courses-contest-prep.html', enrollLink: 'contact.html', enrollLabel: 'Enquire now →'
        }
      ]
    },
    howItWorks: {
      show: true,
      headingPre: 'How Certification',
      headingAccent: 'Works',
      steps: [
        { id: 's1', text: 'Browse and choose your course' },
        { id: 's2', text: 'Apply or book a free counseling session' },
        { id: 's3', text: 'Attend classes, workshops & assessments' },
        { id: 's4', text: 'Pass your evaluation & get certified' }
      ],
      note: "Not sure which path fits? Book a free counseling call and we'll walk through your goals and recommend the certification that matches where you want your career to go.",
      ctaLabel: 'Book a Free Counseling Call',
      ctaLink: 'contact.html'
    }
  },

  // ===========================================================
  // COURSE DETAIL — courses-personal-trainer.html
  // ===========================================================
  coursePT: {
    seo: {
      title: 'Personal Trainer Certification Online & Offline Classes | NFTA',
      description: 'Get your personal trainer certification online or offline with NFTA. Learn exercise science, practical biomechanics and coaching skills in our top-rated classes.'
    },
    hero: {
      show: true,
      bgImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1600&q=80&auto=format&fit=crop',
      eyebrow: '12-week course · ₹30,000 · Online / Offline / Hybrid',
      titlePre: 'Certified Personal',
      titleAccent: 'Trainer',
      sub: "This isn't a course that teaches you to count reps. NFTA's personal trainer certification trains you to assess a client, design a program around their actual limitations, and adjust it when the plan meets reality.",
      ctaLabel: 'Enroll Now', ctaLink: 'contact.html'
    },
    why: {
      show: true,
      headingPre: 'Why Train With',
      headingAccent: 'NFTA',
      lead: "Most personal trainer courses teach you to follow a template. NFTA teaches you to build one — from movement assessment through progressive programming — so you're prepared for the client in front of you, not just the client in the textbook.",
      cards: [
        { id: 'w1', title: 'Science First', body: 'Exercise physiology, biomechanics, and movement mechanics taught with real application, not memorization.' },
        { id: 'w2', title: 'Built for Real Clients', body: 'Practice programming around injuries, time constraints, and conflicting goals — the situations you\'ll actually face.' },
        { id: 'w3', title: 'Learn Your Way', body: 'Choose online, offline, or hybrid classes based on your schedule.' }
      ]
    },
    learn: {
      show: true,
      headingPre: "What You'll",
      headingAccent: 'Learn',
      items: [
        { id: 'l1', text: 'Anatomy, physiology & movement mechanics — how the body moves and adapts under load' },
        { id: 'l2', text: 'Program design & periodization — plans that progress logically, not by guesswork' },
        { id: 'l3', text: 'Client assessment & correction — spot movement faults before they become injuries' },
        { id: 'l4', text: 'Communication & coaching skills — motivate and guide clients toward results they\'ll stick with' },
        { id: 'l5', text: 'Gym & business fundamentals — run sessions, manage clients, operate professionally' }
      ]
    },
    who: {
      show: true,
      headingPre: 'Who This Course',
      headingAccent: 'Is For',
      items: [
        { id: 'wh1', text: 'Career switchers entering the fitness industry' },
        { id: 'wh2', text: 'Gym staff formalizing their training knowledge' },
        { id: 'wh3', text: 'Enthusiasts turning passion into a profession' },
        { id: 'wh4', text: "Anyone who tried generic online certs and wants one that's applied" }
      ]
    },
    how: {
      show: true,
      headingPre: 'How Certification',
      headingAccent: 'Works',
      steps: [
        { id: 's1', text: 'Enroll or book a counseling session' },
        { id: 's2', text: 'Attend classes & hands-on workshops' },
        { id: 's3', text: 'Complete practical assessments' },
        { id: 's4', text: 'Pass your evaluation & get certified' }
      ]
    },
    faqs: {
      show: true,
      headingPre: 'Frequently Asked',
      headingAccent: 'Questions',
      items: [
        { id: 'q1', q: 'Is this certification recognized for gym employment in India?', a: 'NFTA certification is built and taught under the direct guidance of Saravanan "Sharu" Hariram, a respected name in Indian fitness and bodybuilding coaching. Our graduates are placed largely on the strength of this industry reputation and network, alongside the practical skills they build during the course.' },
        { id: 'q2', q: 'Can I complete this personal trainer course online?', a: 'Yes — NFTA offers online, offline, and hybrid formats for this certification.' },
        { id: 'q3', q: 'Do I need prior fitness experience to enroll?', a: 'No formal experience is required — but a basic understanding of fitness fundamentals (common exercises, basic gym terminology) will help you get more out of the course from day one.' }
      ]
    },
    cta: { show: true, heading: 'Ready To Enroll?', ctaLabel: 'Enroll Now', ctaLink: 'contact.html' }
  },

  // ===========================================================
  // COURSE DETAIL — courses-weight-loss-nutritionist.html
  // ===========================================================
  courseWL: {
    seo: {
      title: 'Certified Weight Loss Nutritionist Course | NFTA',
      description: 'Become a Certified Weight Loss Nutritionist with NFTA. Master evidence-based weight management coaching, client psychology, and meal planning as a certified weight loss coach.'
    },
    hero: {
      show: true,
      bgImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1600&q=80&auto=format&fit=crop',
      eyebrow: '4-month course · 24 modules · ₹40,000',
      titlePre: 'Weight Loss',
      titleAccent: 'Nutritionist',
      sub: "Weight loss advice is everywhere, and most of it doesn't hold up past week two. This certification trains you to build sustainable, evidence-based strategies — and coach clients through the part that actually determines results: staying consistent.",
      ctaLabel: 'Enroll Now', ctaLink: 'contact.html'
    },
    why: {
      show: true,
      headingPre: 'Why Get Certified',
      headingAccent: 'Here',
      lead: "Most weight-loss advice fails not because the science is wrong, but because the plan doesn't survive real life. This course trains you to build weight-management strategies that account for that — and to coach clients through the plateaus and setbacks that derail generic diet plans.",
      cards: [
        { id: 'w1', title: 'Evidence-Based, Not Fad-Based', body: 'Learn the actual physiology of sustainable weight loss, not the latest trend.' },
        { id: 'w2', title: 'Built for Real Behavior', body: 'Coach through low-adherence weeks, plateaus, and the psychology of weight loss — not just the meal plan.' },
        { id: 'w3', title: 'Learn Your Way', body: 'Online, offline, or hybrid formats to fit your schedule.' }
      ]
    },
    learn: {
      show: true,
      headingPre: "What You'll",
      headingAccent: 'Learn',
      items: [
        { id: 'l1', text: 'Metabolic fundamentals & weight-management science — energy balance, metabolic adaptation, what drives fat loss' },
        { id: 'l2', text: 'Meal planning for weight loss — realistic, individualized strategies clients can stick to' },
        { id: 'l3', text: 'Client assessment & goal setting — targets that are ambitious but achievable' },
        { id: 'l4', text: 'Coaching psychology & behavior change — why clients fall off track and how to coach them back' },
        { id: 'l5', text: 'Plateau management — recognize and adjust when progress stalls' }
      ]
    },
    who: {
      show: true,
      headingPre: 'Who This Course',
      headingAccent: 'Is For',
      items: [
        { id: 'wh1', text: 'Personal trainers adding weight-loss coaching to their offering' },
        { id: 'wh2', text: 'Career switchers interested in nutrition & weight management' },
        { id: 'wh3', text: 'Enthusiasts formalizing their knowledge into a certified skill' },
        { id: 'wh4', text: 'Anyone who wants to understand — and teach — what actually works' }
      ]
    },
    how: {
      show: true,
      headingPre: 'How Certification',
      headingAccent: 'Works',
      steps: [
        { id: 's1', text: 'Enroll or book a counseling session' },
        { id: 's2', text: 'Attend classes & case-based workshops' },
        { id: 's3', text: 'Complete practical coaching assessments' },
        { id: 's4', text: 'Pass your evaluation & get certified' }
      ]
    },
    faqs: {
      show: true,
      headingPre: 'Frequently Asked',
      headingAccent: 'Questions',
      items: [
        { id: 'q1', q: 'Is this certification recognized for professional coaching in India?', a: 'NFTA\'s weight loss nutritionist certification is built and taught under the direct guidance of Saravanan "Sharu" Hariram, a Certified Sports Nutritionist (CSN) with hands-on experience coaching real clients. Our graduates build their coaching practice on this applied expertise and industry credibility.' },
        { id: 'q2', q: 'Do I need a background in science or nutrition to enroll?', a: 'No formal science background is required — the course builds the metabolic and nutrition fundamentals you need from the ground up. A general interest in health and coaching helps you get the most from it.' },
        { id: 'q3', q: 'Can this be combined with the Personal Trainer certification?', a: "Yes — many students pair the two to offer both training and nutrition coaching. Book a free counseling call and we'll help you plan the right combination and sequence." }
      ]
    },
    cta: { show: true, heading: 'Ready To Enroll?', ctaLabel: 'Enroll Now', ctaLink: 'contact.html' }
  },

  // ===========================================================
  // COURSE DETAIL — courses-contest-prep.html
  // ===========================================================
  courseCP: {
    seo: {
      title: 'Contest Prep Coach Certification & Physique Course | NFTA',
      description: 'Become a Certified Contest-Prep & Body Transformation Expert with NFTA. Learn physique athlete programming, stage posing, and peak-week coaching.'
    },
    hero: {
      show: true,
      bgImage: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1600&q=80&auto=format&fit=crop',
      eyebrow: 'Speciality certification · Taught by an International Bodybuilder',
      titlePre: 'Contest-Prep &',
      titleAccent: 'Transformation',
      sub: 'Coaching a physique athlete through competition prep is a different skill from general personal training — different timelines, different stakes, no room for guesswork. This certification trains you to coach that process from off-season through peak week.',
      ctaLabel: 'Enquire Now', ctaLink: 'contact.html'
    },
    why: {
      show: true,
      headingPre: 'Why Get Certified',
      headingAccent: 'Here',
      lead: "This isn't a general fitness add-on — it's a specialized certification for coaches who want to work with physique and bodybuilding athletes at a competitive level.",
      cards: [
        { id: 'w1', title: 'Competition Experience', body: 'Learn under Saravanan "Sharu" Hariram, an International Bodybuilder who has lived the process he\'s teaching you to coach.' },
        { id: 'w2', title: 'Real Competition Timelines', body: 'Program across an entire prep cycle, not just isolated workouts.' },
        { id: 'w3', title: 'A Specialization That Stands Out', body: 'Few trainers in India can coach contest prep credibly — this positions you as one of them.' }
      ]
    },
    learn: {
      show: true,
      headingPre: "What You'll",
      headingAccent: 'Learn',
      items: [
        { id: 'l1', text: 'Off-season & contest-prep programming — structure training across a full competitive cycle' },
        { id: 'l2', text: 'Peak-week protocols — manage the final, highest-stakes stretch with precision' },
        { id: 'l3', text: 'Posing & presentation coaching — guide athletes on stage presentation' },
        { id: 'l4', text: "Body composition & physique assessment — track and adjust with an athlete's eye" },
        { id: 'l5', text: 'Athlete safety & performance-science awareness — responsible, monitored coaching practice' }
      ]
    },
    who: {
      show: true,
      headingPre: 'Who This Course',
      headingAccent: 'Is For',
      items: [
        { id: 'wh1', text: 'Personal trainers specializing in physique & bodybuilding coaching' },
        { id: 'wh2', text: 'Competitive athletes transitioning into coaching' },
        { id: 'wh3', text: 'Coaches who train physique clients informally and want a formal credential' },
        { id: 'wh4', text: 'Trainers looking to differentiate in a crowded market' }
      ]
    },
    how: {
      show: true,
      headingPre: 'How Certification',
      headingAccent: 'Works',
      steps: [
        { id: 's1', text: 'Enroll or book a counseling session' },
        { id: 's2', text: 'Attend programming, posing & peak-week workshops' },
        { id: 's3', text: 'Complete contest-prep coaching assessments' },
        { id: 's4', text: 'Pass your evaluation & get certified' }
      ]
    },
    faqs: {
      show: true,
      headingPre: 'Frequently Asked',
      headingAccent: 'Questions',
      items: [
        { id: 'q1', q: 'Do I need bodybuilding or competition experience to enroll?', a: "As a specialization, prior training or coaching experience will help you get the most from the course. If you're unsure whether it fits your background, book a free counseling call and we'll confirm the right starting point for you." },
        { id: 'q2', q: 'Is this certification recognized for coaching physique athletes professionally?', a: 'The certification is built and taught under the direct guidance of Saravanan "Sharu" Hariram, an International Bodybuilder and Certified Sports Nutritionist. Graduates build their coaching practice on this applied, competition-tested expertise and industry credibility.' },
        { id: 'q3', q: 'Is coaching available online, offline, or hybrid?', a: "NFTA runs online, offline, and hybrid formats. Reach out and we'll confirm the current format and upcoming batches for this specialization." }
      ]
    },
    cta: { show: true, heading: 'Coach At A Higher Level', ctaLabel: 'Enquire Now', ctaLink: 'contact.html' }
  },

  // ===========================================================
  // TRAINERS — trainers.html
  // ===========================================================
  trainers: {
    seo: {
      title: 'Our Trainers | NFTA — Practitioner-Led Fitness Faculty',
      description: 'Meet the NFTA faculty — led by International Master Trainer Saravanan "Sharu" Hariram. Learn from coaches who still work with real clients, not just instructors.'
    },
    hero: {
      show: true,
      bgImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&q=80&auto=format&fit=crop',
      eyebrow: 'Practitioners, not just instructors',
      titlePre: 'Our',
      titleAccent: 'Trainers',
      sub: "Every program is led by trainers who still coach real clients and compete at a professional level — you're learning from people actively doing the work, not reading from a slide deck."
    },
    lead: {
      show: true,
      photo: 'assets/img/founder-sharu.jpg',
      name: '"Sharu" Saravanan Hariram',
      role: 'Founder & Chief Training Officer',
      creds: 'ACE-PT · CHFT · CSN · PY-T',
      headingPre: 'Led By A',
      headingAccent: 'Working Pro',
      body: 'International Master Trainer, Sports Nutritionist, and International Bodybuilder. Since 2007, Sharu has certified <b>2,500+ trainers</b> — applying competition and coaching expertise directly to how every NFTA curriculum is taught.',
      points: [
        { id: 'p1', text: 'Still coaches real clients' },
        { id: 'p2', text: 'Competes at a professional level' },
        { id: 'p3', text: 'Shapes the curriculum directly' }
      ]
    },
    stats: {
      show: true,
      items: [
        { id: 's1', value: '2500+', label: 'Trainers Certified' },
        { id: 's2', value: '2007', label: 'Since' },
        { id: 's3', value: '3+', label: 'Certifications' },
        { id: 's4', value: '100%', label: 'Practitioner-Led' }
      ]
    },
    team: {
      show: true,
      headingPre: 'What You Learn',
      headingAccent: 'From Them',
      members: [
        { id: 'm1', image: 'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=600&q=80&auto=format&fit=crop', title: 'Applied Coaching', tag: 'Personal Training', body: 'Program design that adapts to the client in front of you, not a generic template.' },
        { id: 'm2', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80&auto=format&fit=crop', title: 'Evidence-Based Nutrition', tag: 'Weight Loss Coaching', body: 'Coaching conversations and meal strategy grounded in evidence, without fad-diet language.' },
        { id: 'm3', image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&q=80&auto=format&fit=crop', title: 'Contest Prep', tag: 'Physique Coaching', body: 'Structured, deadline-driven coaching for competitors, from off-season through peak week.' }
      ]
    },
    cta: { show: true, heading: 'Learn From Practitioners', ctaLabel: 'Browse Courses', ctaLink: 'courses.html' }
  },

  // ===========================================================
  // BLOG — blog.html
  // ===========================================================
  blog: {
    seo: {
      title: 'Fitness, Nutrition & Coaching Insights | NFTA Blog',
      description: 'Practical insights on fitness training, nutrition coaching, and contest prep from the NFTA team — for coaches and clients who want more than trends.'
    },
    hero: {
      show: true,
      bgImage: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1600&q=80&auto=format&fit=crop',
      eyebrow: 'Fitness · Nutrition · Coaching insights',
      titlePre: 'The NFTA',
      titleAccent: 'Blog',
      sub: 'Insights on training, nutrition, and coaching — written for people building a real career in fitness, not chasing trends.'
    },
    categories: {
      show: true,
      headingPre: 'Browse By',
      headingAccent: 'Category',
      // slug 'all' is reserved and always shown first — do not reuse it below.
      items: [
        { id: 'cat1', label: 'Personal Training', slug: 'personal-training' },
        { id: 'cat2', label: 'Weight Loss Nutrition', slug: 'weight-loss' },
        { id: 'cat3', label: 'Contest Prep & Transformation', slug: 'contest-prep' },
        { id: 'cat4', label: 'Career & Certification', slug: 'career' }
      ]
    },
    posts: {
      show: true,
      items: [
        { id: 'post1', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&q=80&auto=format&fit=crop', tag: 'Personal Training', category: 'personal-training', title: 'Assess Before You Program: Reading a New Client', excerpt: "The first session isn't about reps — it's about what the person in front of you can actually do. A practical movement-assessment checklist you can run in ten minutes.", readTime: '6 min read', link: '#' },
        { id: 'post2', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=700&q=80&auto=format&fit=crop', tag: 'Personal Training', category: 'personal-training', title: 'Periodization for Real Clients, Not Textbooks', excerpt: 'How to build a training plan that progresses logically around injuries, missed sessions, and conflicting goals — instead of guessing week to week.', readTime: '7 min read', link: '#' },
        { id: 'post3', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=700&q=80&auto=format&fit=crop', tag: 'Weight Loss Nutrition', category: 'weight-loss', title: 'Why Most Diets Fail by Week Two', excerpt: 'The science is rarely the problem — adherence is. What actually derails fat-loss plans, and how to coach a client past the drop-off point.', readTime: '5 min read', link: '#' },
        { id: 'post4', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=700&q=80&auto=format&fit=crop', tag: 'Weight Loss Nutrition', category: 'weight-loss', title: 'Coaching the Plateau: What to Adjust When Fat Loss Stalls', excerpt: 'Before you default to "eat less, move more," here\'s a smarter order of operations for reading and breaking a genuine weight-loss plateau.', readTime: '6 min read', link: '#' },
        { id: 'post5', image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=700&q=80&auto=format&fit=crop', tag: 'Contest Prep & Transformation', category: 'contest-prep', title: "Peak Week, Demystified: A Coach's Framework", excerpt: "The highest-stakes stretch of a physique athlete's prep, broken into a calm, repeatable framework — with the mistakes that undo months of work.", readTime: '8 min read', link: '#' },
        { id: 'post6', image: 'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=700&q=80&auto=format&fit=crop', tag: 'Career & Certification', category: 'career', title: 'Turning a Passion for Fitness Into a Coaching Career in India', excerpt: 'What separates certified enthusiasts from working coaches — the skills, the credibility, and the first real clients — mapped for the Indian market.', readTime: '7 min read', link: '#' }
      ]
    },
    note: 'More articles publishing soon. Want a topic covered? Tell us →',
    cta: { show: true, heading: 'Learn It Properly', ctaLabel: 'Browse Courses', ctaLink: 'courses.html' }
  },

  // ===========================================================
  // CONTACT — contact.html
  // ===========================================================
  contact: {
    seo: {
      title: 'Contact NFTA – Enroll or Get Course Guidance',
      description: "Have questions about NFTA's certification courses? Reach out for enrollment support, course guidance, or a free counseling session."
    },
    hero: {
      show: true,
      bgImage: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1600&q=80&auto=format&fit=crop',
      eyebrow: "We're happy to help",
      titlePre: 'Get In',
      titleAccent: 'Touch',
      sub: "Have a question about which certification is right for you? Reach out — we'll help you figure out the right path before you enroll."
    },
    methods: {
      show: true,
      headingPre: 'Ways To',
      headingAccent: 'Reach Us',
      // labels are editable text; the actual phone/email/social values come from site.contact.*
      bookLabel: 'Book a free counseling session',
      bookActionLabel: 'Talk through your goals first →'
    },
    form: {
      show: true,
      courseOptions: [
        { id: 'o1', text: 'Certified Personal Trainer' },
        { id: 'o2', text: 'Weight Loss Nutritionist' },
        { id: 'o3', text: 'Contest-Prep & Body Transformation' },
        { id: 'o4', text: 'Not sure — need guidance' }
      ]
    },
    faqs: {
      show: true,
      headingPre: 'Frequently Asked',
      headingAccent: 'Questions',
      items: [
        { id: 'q1', q: 'How do I choose the right course for me?', a: "Book a free counseling session — we'll walk through your goals and recommend the certification that fits where you want your career to go." },
        { id: 'q2', q: 'Do you offer online classes?', a: 'Yes — NFTA offers online, offline, and hybrid formats so the course fits your schedule instead of the other way around.' },
        { id: 'q3', q: 'Is NFTA certification recognized for gym employment in India?', a: 'NFTA certification is built and taught under the direct guidance of Saravanan "Sharu" Hariram, a respected name in Indian fitness and bodybuilding coaching. Graduates are placed largely on the strength of this reputation and network, alongside the practical skills they build during the course.' },
        { id: 'q4', q: 'Do I need prior fitness experience to enroll?', a: 'No formal experience is required — but a basic understanding of fitness fundamentals will help you get more out of the course from day one.' }
      ]
    }
  }
};

/**
 * Deep-merges a Firestore-stored content document over DEFAULT_CONTENT.
 * - Plain objects merge key-by-key (recursively).
 * - Arrays, strings, numbers, booleans from `stored` fully replace the default.
 * - Missing/undefined/null values in `stored` fall back to the default.
 * Never throws: a malformed stored doc just yields more defaults.
 */
export function mergeContent(defaults, stored) {
  if (stored == null || typeof stored !== 'object' || Array.isArray(stored)) {
    return defaults;
  }
  const out = Array.isArray(defaults) ? [...defaults] : { ...defaults };
  for (const key of Object.keys(stored)) {
    const storedVal = stored[key];
    const defaultVal = defaults ? defaults[key] : undefined;
    if (
      storedVal !== null &&
      typeof storedVal === 'object' &&
      !Array.isArray(storedVal) &&
      defaultVal !== null &&
      typeof defaultVal === 'object' &&
      !Array.isArray(defaultVal)
    ) {
      out[key] = mergeContent(defaultVal, storedVal);
    } else if (storedVal !== undefined) {
      out[key] = storedVal;
    }
  }
  return out;
}
