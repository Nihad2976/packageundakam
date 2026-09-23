export const COMPANIES = {
  NAJ: 'naj',
  PIKTORIA: 'piktoria',
  LITHE_ADS: 'litheads',
  FEWDAYS: 'fewdays',
}

export const COMPANY_CONFIGS = {
  [COMPANIES.NAJ]: {
    id: 'naj',
    name: 'NAJ WEDDING',
    shortName: 'NAJ Wedding',
    tagline: 'Package & Invoice Generator',
    theme: {
      primary: '#9a7b38',
      gold: '#c5a059',
      dark: '#1e1e1e',
      bg: '#ffffff',
    },
    contact: {
      phone: '+91-94008 80944',
      location: 'Guruvayoor,Althara',
      addressLine: 'Guruvayoor, Althara',
    },
    invoiceTerms: [
      'All invoices must be paid within 5 days from the date of the invoice unless otherwise agreed upon in writing. Late payments may incur additional charges.',
    ],
    quotationTerms: [
      'Advance: 4% (Booking confirmation)',
      'On Wedding Day: 66%',
      'After Final Delivery: 30%',
    ],
    defaultServices: [
      { id: 'couple_reel', name: 'Couple Reel', category: 'video' },
      { id: 'function_reel', name: 'Function Reel', category: 'video' },
      { id: 'wedding_full_length', name: 'Wedding Full Length Video', category: 'video' },
      { id: 'suggestion_reel', name: 'Suggestion Reel', category: 'video' },
      { id: 'wedding_highlights', name: 'Wedding Highlights Video', category: 'video' },
      {
        id: 'graded_photos',
        name: 'Professionally Graded Photos (Smart Album)',
        category: 'photo',
        hasPhotoQuantity: true,
        defaultQuantity: '200+',
      },
      { id: 'premium_album', name: '30 Leaf Premium Album', category: 'photo', hasLeafCount: true, defaultLeaves: 30 },
      { id: 'mini_album', name: 'Mini Album', category: 'photo' },
      { id: 'table_calendar', name: 'Table Calendar', category: 'photo' },
      { id: 'live_qr', name: 'Live QR Code Photo Gallery (Day & Reception)', category: 'other' },
      { id: 'soft_copy', name: 'Soft Copy (Provided via Pendrive)', category: 'other' },
    ],
    packagePresets: {
      with_album: [
        'couple_reel',
        'function_reel',
        'wedding_highlights',
        'graded_photos',
        'premium_album',
        'mini_album',
        'table_calendar',
        'soft_copy',
      ],
      without_album: [
        'couple_reel',
        'function_reel',
        'wedding_highlights',
        'graded_photos',
        'soft_copy',
      ],
    },
  },
  [COMPANIES.PIKTORIA]: {
    id: 'piktoria',
    name: 'PIKTORIA WEDDINGS',
    shortName: 'Piktoria Weddings',
    tagline: 'WEDDING COMPANY',
    theme: {
      primary: '#0e3b32',
      accent: '#195346',
      dark: '#0c2e27',
      creamBg: '#f7f6f0',
    },
    contact: {
      phone: '+91 8138075671',
      phoneDisplay: '8138-075671',
      location: 'Changarkulam,Malappuram',
      addressLine: 'Changarkulam, Malappuram',
    },
    invoiceTerms: [
      'All invoices must be paid within 30 days from the date of the invoice unless otherwise agreed upon in writing. Late payments may incur additional charges.',
    ],
    quotationTerms: [
      'Advance: 4% (Booking confirmation)',
      'On Wedding Day: 66%',
      'After Final Delivery: 30%',
    ],
    defaultServices: [
      { id: 'reels_30s', name: 'Reels – 30 Seconds', category: 'video' },
      {
        id: 'graded_photos',
        name: '100+ Professionally Edited Photos – Digital Album',
        category: 'photo',
        hasPhotoQuantity: true,
        defaultQuantity: '100+',
      },
      { id: 'wedding_highlights', name: 'Wedding Highlights Video – 3–5 Minutes', category: 'video' },
      { id: 'piktoria_album', name: '40-Leaf Wedding Album', category: 'photo', hasLeafCount: true, defaultLeaves: 40 },
      { id: 'mini_album', name: 'Mini Photo Album', category: 'photo' },
      { id: 'photo_frame', name: 'Photo Frame', category: 'photo' },
      { id: 'calendar', name: 'Calendar', category: 'photo' },
      { id: 'soft_copy', name: 'Soft Copy – Pen Drive or Cloud Drive (Client’s Choice)', category: 'other' },
    ],
    packagePresets: {
      with_album: [
        'reels_30s',
        'graded_photos',
        'wedding_highlights',
        'piktoria_album',
        'mini_album',
        'photo_frame',
        'calendar',
        'soft_copy',
      ],
      without_album: [
        'reels_30s',
        'graded_photos',
        'wedding_highlights',
        'photo_frame',
        'calendar',
        'soft_copy',
      ],
    },
  },
  [COMPANIES.LITHE_ADS]: {
    id: 'litheads',
    name: 'LITHE ADS',
    shortName: 'Lithe Ads',
    tagline: 'for the euphoric moments',
    theme: {
      primary: '#32452f',
      accent: '#445b3f',
      dark: '#222f20',
      creamBg: '#f2ede4',
      bg: '#ffffff',
    },
    contact: {
      phone: '+91 8139 880 797 , +91 9633 088 797 , +91 9745 826 630',
      phoneDisplay: '+91 8139 880 797',
      email: 'lithe.adsevents@gmail.com',
      instagram: 'www.instagram/Lithe_ads',
      location: 'Southside',
      addressLine: 'Southside-based wedding company',
    },
    invoiceTerms: [
      'All invoices must be paid according to the payment policy terms unless agreed upon in writing.',
    ],
    quotationTerms: [
      '10% on Booking',
      '70% on wedding day',
      '20% after receiving output',
    ],
    defaultServices: [
      { id: 'wedding_album_80p', name: '80 Pages wedding album', category: 'photo', hasLeafCount: true, defaultLeaves: 40 },
      { id: 'colour_graded_images', name: 'Whole images will be colour graded', category: 'photo' },
      { id: 'online_gallery', name: 'Online photo gallery', category: 'other' },
      { id: 'usb_hard_drive', name: 'Usb hard drive', category: 'other' },
      { id: 'wedding_highlights_lithe', name: 'Wedding highlight video (approx 5-10 min)', category: 'video' },
      { id: 'social_reels', name: 'Social media reels (30sec each)', category: 'video' },
      { id: 'pre_wed_reel', name: 'pre wed reel', category: 'video' },
      { id: 'pre_wed_photos', name: 'pre wed colour graded photos', category: 'photo' },
      { id: 'pre_wed_shoot', name: 'Pre wed photoshoot and videography', category: 'addon' },
      { id: 'mini_album', name: 'mini album', category: 'addon' },
      { id: 'calendar', name: 'calender', category: 'addon' },
      { id: 'photo_frames', name: 'photo frames', category: 'addon' },
    ],
    packagePresets: {
      with_album: [
        'wedding_album_80p',
        'colour_graded_images',
        'online_gallery',
        'usb_hard_drive',
        'wedding_highlights_lithe',
        'social_reels',
        'pre_wed_reel',
        'pre_wed_photos',
        'pre_wed_shoot',
        'mini_album',
        'calendar',
        'photo_frames',
      ],
      without_album: [
        'colour_graded_images',
        'online_gallery',
        'usb_hard_drive',
        'wedding_highlights_lithe',
        'social_reels',
        'pre_wed_reel',
        'pre_wed_photos',
        'photo_frames',
      ],
    },
  },
  [COMPANIES.FEWDAYS]: {
    id: 'fewdays',
    name: 'FEWDAYS STORIES',
    shortName: 'Fewdays Stories',
    tagline: 'WEDDING PHOTOGRAPHY & VIDEOGRAPHY',
    theme: {
      primary: '#97342c',
      accent: '#80261f',
      dark: '#3b1c18',
      creamBg: '#f0ece1',
      bg: '#f0ece1',
    },
    contact: {
      phone: '+91 97456 66191',
      phoneDisplay: '+91 97456 66191',
      email: 'fewdaysstories@gmail.com',
      instagram: 'fewdays.stories',
      website: 'https://fewdaysstories.wfolio.pro',
      location: 'Guruvayoor, Kerala',
      addressLine: 'Guruvayoor, Kerala',
    },
    invoiceTerms: [
      'All invoices must be paid within 5 days from the date of the invoice unless otherwise agreed upon in writing. Late payments may incur additional charges.',
    ],
    quotationTerms: [
      'Advance: 4% (Booking confirmation)',
      'On Wedding Day: 66%',
      'After Final Delivery: 30%',
    ],
    defaultEvents: [
      {
        name: 'Mehandi Night',
        services: ['1 Traditional Photographer', '1 Traditional Cinematographer'],
      },
      {
        name: 'Wedding Day',
        services: ['1 Traditional Photographer', '1 Traditional Cinematographer'],
      },
    ],
    defaultDeliverables: [
      'Edited Photos',
      'Spot Edited Photos (For Story/Status)',
      'Couple Reel',
      'Function Reel',
      'Complimentary Post-Wedding Shoot (Photo & Video)',
      '40 Leaf Premium Luster Laminated Album',
      '10 Extra Leaves (Complimentary)',
      '10 Leaf Mini Album',
      'Photo Calendar',
      'Photo Frame',
      'Wedding Highlights (3 to 7 min)',
      'Wedding Full Length Video (10+ min)',
      'Drone Service',
      'Live QR Photo Service',
      'Soft Copy (Provided via Pendrive)',
    ],
    defaultPrice: 119000,
  },
}

export function getCompanyFromUser(user) {
  if (!user) return COMPANIES.NAJ
  if (user.company === COMPANIES.FEWDAYS) return COMPANIES.FEWDAYS
  if (user.company === COMPANIES.PIKTORIA) return COMPANIES.PIKTORIA
  if (user.company === COMPANIES.LITHE_ADS) return COMPANIES.LITHE_ADS
  const lowerName = (user.name || '').toLowerCase()
  const lowerEmail = (user.email || '').toLowerCase()
  const lowerUsername = (user.username || '').toLowerCase()
  if (lowerName.includes('fewday') || lowerEmail.includes('fewday') || lowerUsername.includes('fewday')) {
    return COMPANIES.FEWDAYS
  }
  if (lowerName.includes('piktoria') || lowerEmail.includes('piktoria') || lowerUsername.includes('piktoria')) {
    return COMPANIES.PIKTORIA
  }
  if (lowerName.includes('lithe') || lowerEmail.includes('lithe') || lowerUsername.includes('litheads')) {
    return COMPANIES.LITHE_ADS
  }
  return COMPANIES.NAJ
}
