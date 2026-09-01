export const CLIENT_TYPES = {
  GROOM: 'groom',
  BRIDE: 'bride',
  BOTH: 'both',
}

export const PACKAGES = {
  WITH_ALBUM: 'with_album',
  WITHOUT_ALBUM: 'without_album',
}

export const PACKAGE_LABELS = {
  [PACKAGES.WITH_ALBUM]: 'With Album',
  [PACKAGES.WITHOUT_ALBUM]: 'Without Album',
}

export const COVERAGE_SIDES = {
  BRIDE: 'bride',
  GROOM: 'groom',
  BOTH: 'both',
}

export const COVERAGE_SIDE_LABELS = {
  [COVERAGE_SIDES.BRIDE]: 'Bride Side',
  [COVERAGE_SIDES.GROOM]: 'Groom Side',
  [COVERAGE_SIDES.BOTH]: 'Both / Combined',
}

export const COVERAGE_TYPES = {
  BRIDE_EVE: 'bride_eve',
  WEDDING_NIKKAH: 'wedding_nikkah',
  GROOM_EVE: 'groom_eve',
  WEDDING_DAY: 'wedding_day',
  WEDDING_RECEPTION: 'wedding_reception',
  ENGAGEMENT: 'engagement',
  HALDI: 'haldi',
  CUSTOM: 'custom',
}

export const COVERAGE_LABELS = {
  [COVERAGE_TYPES.BRIDE_EVE]: 'Bride Eve',
  [COVERAGE_TYPES.WEDDING_NIKKAH]: 'Wedding Nikkah',
  [COVERAGE_TYPES.GROOM_EVE]: 'Groom Eve',
  [COVERAGE_TYPES.WEDDING_DAY]: 'Wedding Day',
  [COVERAGE_TYPES.WEDDING_RECEPTION]: 'Wedding Reception',
  [COVERAGE_TYPES.ENGAGEMENT]: 'Engagement',
  [COVERAGE_TYPES.HALDI]: 'Haldi',
  [COVERAGE_TYPES.CUSTOM]: 'Custom',
}

export const TEAM_ROLES = [
  { id: 'traditional_photographer', label: 'Traditional Photographer' },
  { id: 'traditional_cinematographer', label: 'Traditional Cinematographer' },
  { id: 'candid_photographer', label: 'Candid Photographer' },
  { id: 'candid_cinematographer', label: 'Candid Cinematographer' },
]

export const SERVICES = [
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
  },
  { id: 'premium_album', name: '30 Leaf Premium Album', category: 'photo' },
  { id: 'mini_album', name: 'Mini Album', category: 'photo' },
  { id: 'table_calendar', name: 'Table Calendar', category: 'photo' },
  { id: 'live_qr', name: 'Live QR Code Photo Gallery (Day & Reception)', category: 'other' },
  { id: 'soft_copy', name: 'Soft Copy (Provided via Pendrive)', category: 'other' },
]

export const PACKAGE_PRESETS = {
  [PACKAGES.WITH_ALBUM]: [
    'couple_reel',
    'function_reel',
    'wedding_highlights',
    'graded_photos',
    'premium_album',
    'mini_album',
    'table_calendar',
    'soft_copy',
  ],
  [PACKAGES.WITHOUT_ALBUM]: [
    'couple_reel',
    'function_reel',
    'wedding_highlights',
    'graded_photos',
    'soft_copy',
  ],
}

export const PAYMENT_TERMS = [
  'Advance: 4% (Booking confirmation)',
  'On Wedding Day: 66%',
  'After Final Delivery: 30%',
]

export const FORM_STEPS = [
  { id: 'client', label: 'Client' },
  { id: 'package', label: 'Package' },
  { id: 'coverage', label: 'Coverage' },
  { id: 'services', label: 'Services' },
  { id: 'price', label: 'Price' },
  { id: 'preview', label: 'Preview' },
]

export const DEFAULT_PHOTO_QUANTITY = '200+'
