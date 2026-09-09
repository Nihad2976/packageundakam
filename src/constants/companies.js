export const COMPANIES = {
  NAJ: 'naj',
  PIKTORIA: 'piktoria',
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
}

export function getCompanyFromUser(user) {
  if (!user) return COMPANIES.NAJ
  if (user.company === COMPANIES.PIKTORIA) return COMPANIES.PIKTORIA
  const lowerName = (user.name || '').toLowerCase()
  const lowerEmail = (user.email || '').toLowerCase()
  if (lowerName.includes('piktoria') || lowerEmail.includes('piktoria')) {
    return COMPANIES.PIKTORIA
  }
  return COMPANIES.NAJ
}
