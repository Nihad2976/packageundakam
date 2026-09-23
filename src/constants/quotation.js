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
  { id: 'premium_album', name: '30 Leaf Premium Album', category: 'photo', hasLeafCount: true, defaultLeaves: 30 },
  { id: 'mini_album', name: 'Mini Album', category: 'photo' },
  { id: 'table_calendar', name: 'Table Calendar', category: 'photo' },
  { id: 'live_qr', name: 'Live QR Code Photo Gallery (Day & Reception)', category: 'other' },
  { id: 'soft_copy', name: 'Soft Copy (Provided via Pendrive)', category: 'other' },
]

export const LEAF_OPTIONS = [25, 30, 35, 40, 45, 50]

export const PIKTORIA_SERVICES = [
  { id: 'reels_30s', name: 'Reels – 30 Seconds', category: 'video' },
  {
    id: 'graded_photos',
    name: '100+ Professionally Edited Photos – Digital Album',
    category: 'photo',
    hasPhotoQuantity: true,
  },
  { id: 'wedding_highlights', name: 'Wedding Highlights Video – 3–5 Minutes', category: 'video' },
  { id: 'piktoria_album', name: '40-Leaf Wedding Album', category: 'photo', hasLeafCount: true, defaultLeaves: 40 },
  { id: 'mini_album', name: 'Mini Photo Album', category: 'photo' },
  { id: 'photo_frame', name: 'Photo Frame', category: 'photo' },
  { id: 'calendar', name: 'Calendar', category: 'photo' },
  { id: 'soft_copy', name: 'Soft Copy – Pen Drive or Cloud Drive (Client’s Choice)', category: 'other' },
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

export const PIKTORIA_PACKAGE_PRESETS = {
  [PACKAGES.WITH_ALBUM]: [
    'reels_30s',
    'graded_photos',
    'wedding_highlights',
    'piktoria_album',
    'mini_album',
    'photo_frame',
    'calendar',
    'soft_copy',
  ],
  [PACKAGES.WITHOUT_ALBUM]: [
    'reels_30s',
    'graded_photos',
    'wedding_highlights',
    'photo_frame',
    'calendar',
    'soft_copy',
  ],
}

export const LITHE_ADS_TEAM_ROLES = [
  { id: 'photographer', label: 'Photographer' },
  { id: 'videographer', label: 'Videographer' },
]

export const LITHE_ADS_SERVICES = [
  { id: 'wedding_album_80p', name: '80 Pages Wedding Album', category: 'deliverable', hasLeafCount: true, defaultLeaves: 40 },
  { id: 'colour_graded_images', name: 'Whole Images Will Be Colour Graded', category: 'deliverable' },
  { id: 'online_gallery', name: 'Online Photo Gallery', category: 'deliverable' },
  { id: 'usb_hard_drive', name: 'Usb Hard Drive', category: 'deliverable' },
  { id: 'wedding_highlights_lithe', name: 'Wedding Highlight Video (Approx 5–10 Min)', category: 'deliverable' },
  { id: 'social_reels', name: 'Social Media Reels (30 Sec Each)', category: 'deliverable' },
  { id: 'pre_wed_reel', name: 'Pre Wed Reel', category: 'deliverable' },
  { id: 'pre_wed_photos', name: 'Pre Wed Colour Graded Photos', category: 'deliverable' },
  { id: 'pre_wed_shoot', name: 'Pre Wed Photoshoot And Videography', category: 'addon' },
  { id: 'mini_album', name: 'Mini Album', category: 'addon' },
  { id: 'calendar', name: 'Calender', category: 'addon' },
  { id: 'photo_frames', name: 'Photo Frames', category: 'addon' },
]

export const LITHE_ADS_PACKAGE_PRESETS = {
  [PACKAGES.WITH_ALBUM]: [
    'wedding_album_80p',
    'colour_graded_images',
    'online_gallery',
    'usb_hard_drive',
    'wedding_highlights_lithe',
    'social_reels',
    'mini_album',
    'calendar',
    'photo_frames',
  ],
  [PACKAGES.WITHOUT_ALBUM]: [
    'colour_graded_images',
    'online_gallery',
    'usb_hard_drive',
    'wedding_highlights_lithe',
    'social_reels',
    'photo_frames',
  ],
}

export const FEWDAYS_TEAM_ROLES = [
  { id: 'traditional_photographer', label: 'Traditional Photographer' },
  { id: 'traditional_cinematographer', label: 'Traditional Cinematographer' },
  { id: 'candid_photographer', label: 'Candid Photographer' },
  { id: 'candid_cinematographer', label: 'Candid Cinematographer' },
  { id: 'drone_pilot', label: 'Drone Pilot' },
]

export const FEWDAYS_SERVICES = [
  {
    id: 'edited_photos',
    name: 'Edited Photos',
    category: 'photo',
    hasPhotoQuantity: true,
    defaultQuantity: '200+',
  },
  { id: 'spot_edited_photos', name: 'Spot Edited Photos (For Story/Status)', category: 'photo' },
  {
    id: 'fewdays_album',
    name: '40 Leaf Premium Luster Laminated Album',
    category: 'photo',
    hasLeafCount: true,
    defaultLeaves: 40,
  },
  { id: 'extra_leaves_10', name: '10 Extra Leaves (Complimentary)', category: 'photo' },
  { id: 'mini_album', name: '10 Leaf Mini Album', category: 'photo' },
  { id: 'photo_calendar', name: 'Photo Calendar', category: 'photo' },
  { id: 'photo_frame', name: 'Photo Frame', category: 'photo' },
  { id: 'couple_reel', name: 'Couple Reel', category: 'video' },
  { id: 'function_reel', name: 'Function Reel', category: 'video' },
  { id: 'wedding_highlights', name: 'Wedding Highlights (3 to 7 min)', category: 'video' },
  { id: 'wedding_full_length', name: 'Wedding Full Length Video (10+ min)', category: 'video' },
  { id: 'complimentary_post_wedding', name: 'Complimentary Post-Wedding Shoot (Photo & Video)', category: 'other' },
  { id: 'drone_service', name: 'Drone Service', category: 'other' },
  { id: 'live_qr', name: 'Live QR Photo Service', category: 'other' },
  { id: 'soft_copy', name: 'Soft Copy (Provided via Pendrive)', category: 'other' },
]

export const FEWDAYS_PACKAGE_PRESETS = {
  [PACKAGES.WITH_ALBUM]: [
    'edited_photos',
    'spot_edited_photos',
    'couple_reel',
    'function_reel',
    'fewdays_album',
    'extra_leaves_10',
    'photo_calendar',
    'wedding_highlights',
    'soft_copy',
  ],
  [PACKAGES.WITHOUT_ALBUM]: [
    'edited_photos',
    'spot_edited_photos',
    'couple_reel',
    'function_reel',
    'wedding_highlights',
    'soft_copy',
  ],
}

export function getServicesForCompany(company) {
  if (company === 'fewdays') return FEWDAYS_SERVICES
  if (company === 'litheads') return LITHE_ADS_SERVICES
  if (company === 'piktoria') return PIKTORIA_SERVICES
  return SERVICES
}

export function getPackagePresetsForCompany(company) {
  if (company === 'fewdays') return FEWDAYS_PACKAGE_PRESETS
  if (company === 'litheads') return LITHE_ADS_PACKAGE_PRESETS
  if (company === 'piktoria') return PIKTORIA_PACKAGE_PRESETS
  return PACKAGE_PRESETS
}

export function getTeamRolesForCompany(company) {
  if (company === 'fewdays') return FEWDAYS_TEAM_ROLES
  if (company === 'litheads') return LITHE_ADS_TEAM_ROLES
  return TEAM_ROLES
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

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
