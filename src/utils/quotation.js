import {
  CLIENT_TYPES,
  PACKAGES,
  PACKAGE_PRESETS,
  SERVICES,
  PIKTORIA_SERVICES,
  LITHE_ADS_SERVICES,
  getServicesForCompany,
  getPackagePresetsForCompany,
  DEFAULT_PHOTO_QUANTITY,
  COVERAGE_TYPES,
  COVERAGE_LABELS,
  COVERAGE_SIDES,
} from '../constants/quotation'

export function buildGreeting(clientType, groomName, brideName) {
  const groom = groomName?.trim()
  const bride = brideName?.trim()

  if (clientType === CLIENT_TYPES.GROOM && groom) {
    return `Hi Mr. ${groom},`
  }
  if (clientType === CLIENT_TYPES.BRIDE && bride) {
    return `Hi Ms. ${bride},`
  }
  if (clientType === CLIENT_TYPES.BOTH && groom && bride) {
    return `Hi Mr. ${groom} & Ms. ${bride},`
  }
  if (clientType === CLIENT_TYPES.BOTH && groom) {
    return `Hi Mr. ${groom},`
  }
  if (clientType === CLIENT_TYPES.BOTH && bride) {
    return `Hi Ms. ${bride},`
  }
  return 'Hi,'
}

export function getDisplayName(quotation) {
  if (quotation?.clientName?.trim()) {
    return quotation.clientName.trim()
  }
  const { clientType, groomName, brideName } = quotation
  const groom = groomName?.trim()
  const bride = brideName?.trim()

  if (clientType === CLIENT_TYPES.GROOM) return groom || 'Unnamed'
  if (clientType === CLIENT_TYPES.BRIDE) return bride || 'Unnamed'
  if (groom && bride) return `${groom} & ${bride}`
  return groom || bride || 'Unnamed'
}

export function getPdfFileName(quotation) {
  if (quotation?.clientName?.trim()) {
    return `${quotation.clientName.trim().replace(/\s+/g, '_')}_Package.pdf`
  }
  const { clientType, groomName, brideName } = quotation
  const groom = groomName?.trim()
  const bride = brideName?.trim()

  if (clientType === CLIENT_TYPES.GROOM && groom) {
    return `${groom.replace(/\s+/g, '_')}_Quotation.pdf`
  }
  if (clientType === CLIENT_TYPES.BRIDE && bride) {
    return `${bride.replace(/\s+/g, '_')}_Quotation.pdf`
  }
  if (groom && bride) {
    return `${groom.replace(/\s+/g, '_')}_${bride.replace(/\s+/g, '_')}_Quotation.pdf`
  }
  return `${(groom || bride || 'Client').replace(/\s+/g, '_')}_Quotation.pdf`
}

export function formatPrice(price) {
  const num = Number(String(price).replace(/[^\d]/g, ''))
  if (!num) return '₹0'
  return `₹${num.toLocaleString('en-IN')}`
}

export function formatLitheTotal(price) {
  if (!price && price !== 0) return '75,000'
  const num = Number(String(price).replace(/[^\d]/g, ''))
  if (!num) return String(price)
  return num.toLocaleString('en-IN')
}

export function getDayWithSuffix(day) {
  const num = parseInt(day, 10)
  if (isNaN(num)) return day ? String(day) : ''
  const j = num % 10
  const k = num % 100
  if (j === 1 && k !== 11) {
    return `${num}st`
  }
  if (j === 2 && k !== 12) {
    return `${num}nd`
  }
  if (j === 3 && k !== 13) {
    return `${num}rd`
  }
  return `${num}th`
}

export function parseMonthAndDay(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return { month: 'October', day: 9 }
  const clean = dateStr.trim()
  const m = clean.match(/^([a-zA-Z]+)\s+([0-9]{1,2})(?:st|nd|rd|th)?$/i)
  if (m) {
    const monthNames = {
      jan: 'January',
      feb: 'February',
      mar: 'March',
      apr: 'April',
      may: 'May',
      jun: 'June',
      jul: 'July',
      aug: 'August',
      sep: 'September',
      oct: 'October',
      nov: 'November',
      dec: 'December',
    }
    const prefix = m[1].toLowerCase().slice(0, 3)
    const fullMonth = monthNames[prefix] || m[1]
    const dayNum = parseInt(m[2], 10)
    return { month: fullMonth, day: dayNum }
  }
  return { month: 'October', day: 9 }
}

export function getCoverageDateLabel(coverage) {
  if (!coverage) return ''
  let month = coverage.month
  let day = coverage.day
  if (!month || !day) {
    const parsed = parseMonthAndDay(coverage.date)
    month = month || parsed.month
    day = day || parsed.day
  }
  const monthShort = month ? month.slice(0, 3) : ''
  const dayWithSuffix = getDayWithSuffix(day)
  return `${monthShort} ${dayWithSuffix}`.trim()
}

export function formatLithePackageHeading(coverages) {
  if (!coverages || !Array.isArray(coverages) || coverages.length === 0) {
    return 'Wedding package'
  }

  const parsed = coverages
    .map((cov) => {
      let month = cov.month
      let day = cov.day
      if (!month || !day) {
        const p = parseMonthAndDay(cov.date)
        month = month || p.month
        day = day || p.day
      }
      const dayNum = parseInt(day, 10)
      const dayWithSuffix = !isNaN(dayNum) ? getDayWithSuffix(dayNum) : (day ? String(day) : '')
      return {
        month: month || 'October',
        dayNum: !isNaN(dayNum) ? dayNum : null,
        dayWithSuffix,
      }
    })
    .filter((p) => p.dayWithSuffix)

  if (parsed.length === 0) return 'Wedding package'

  const firstMonth = parsed[0].month
  const allSameMonth = parsed.every((p) => p.month.toLowerCase() === firstMonth.toLowerCase())

  if (allSameMonth) {
    if (parsed.length === 1) {
      return `Wedding package for ${firstMonth} ${parsed[0].dayWithSuffix}`
    }
    if (parsed.length === 2) {
      return `Wedding package for ${firstMonth} ${parsed[0].dayWithSuffix} & ${parsed[1].dayWithSuffix}`
    }
    const days = parsed.map((p) => p.dayWithSuffix)
    const allExceptLast = days.slice(0, -1).join(', ')
    const last = days[days.length - 1]
    return `Wedding package for ${firstMonth} ${allExceptLast} & ${last}`
  }

  const formattedItems = parsed.map((p) => `${p.month} ${p.dayWithSuffix}`)
  if (formattedItems.length === 1) {
    return `Wedding package for ${formattedItems[0]}`
  }
  if (formattedItems.length === 2) {
    return `Wedding package for ${formattedItems[0]} & ${formattedItems[1]}`
  }
  const allExceptLast = formattedItems.slice(0, -1).join(', ')
  const last = formattedItems[formattedItems.length - 1]
  return `Wedding package for ${allExceptLast} & ${last}`
}

export const formatLithePackageTitle = formatLithePackageHeading

export function createServiceSelection(serviceId, quantity = 1, company = 'naj') {
  const allServices = [...SERVICES, ...PIKTORIA_SERVICES, ...LITHE_ADS_SERVICES]
  const service = allServices.find((s) => s.id === serviceId)
  return {
    id: serviceId,
    selected: true,
    quantity,
    photoQuantity: service?.hasPhotoQuantity ? (company === 'piktoria' ? '100+' : DEFAULT_PHOTO_QUANTITY) : undefined,
    leafCount: service?.hasLeafCount ? (company === 'piktoria' || company === 'litheads' ? 40 : 30) : undefined,
  }
}

export function buildPresetServices(packageType, company = 'naj') {
  const serviceList = getServicesForCompany(company)
  const presets = getPackagePresetsForCompany(company)
  const presetIds = presets[packageType] || []
  return serviceList.map((service) => {
    const isSelected = presetIds.includes(service.id)
    return {
      id: service.id,
      selected: isSelected,
      quantity: isSelected ? 1 : 0,
      photoQuantity: service.hasPhotoQuantity ? (company === 'piktoria' ? '100+' : DEFAULT_PHOTO_QUANTITY) : undefined,
      leafCount: service.hasLeafCount ? (company === 'piktoria' ? 40 : 30) : undefined,
    }
  })
}

export function getDefaultSide(type) {
  if (type === COVERAGE_TYPES.BRIDE_EVE || type === COVERAGE_TYPES.WEDDING_NIKKAH) {
    return COVERAGE_SIDES.BRIDE
  }
  if (type === COVERAGE_TYPES.GROOM_EVE) {
    return COVERAGE_SIDES.GROOM
  }
  return COVERAGE_SIDES.GROOM
}

export function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
}

export function createEmptyCoverage(type = COVERAGE_TYPES.BRIDE_EVE, customName = '', side = null, date = '', company = 'naj') {
  const actualSide = side || getDefaultSide(type)
  if (company === 'litheads') {
    const { month, day } = parseMonthAndDay(date)
    return {
      id: generateUUID(),
      type,
      customName,
      month,
      day,
      date: date || `${month.slice(0, 3)} ${getDayWithSuffix(day)}`,
      side: actualSide,
      roles: [
        { id: 'photographer', selected: true, quantity: 1 },
        { id: 'videographer', selected: true, quantity: 1 },
      ],
    }
  }
  return {
    id: generateUUID(),
    type,
    customName,
    date,
    side: actualSide,
    roles: [
      { id: 'traditional_photographer', selected: type !== COVERAGE_TYPES.WEDDING_NIKKAH, quantity: type !== COVERAGE_TYPES.WEDDING_NIKKAH ? 1 : 1 },
      { id: 'traditional_cinematographer', selected: true, quantity: 1 },
      { id: 'candid_photographer', selected: type === COVERAGE_TYPES.WEDDING_NIKKAH || type === COVERAGE_TYPES.WEDDING_DAY, quantity: (type === COVERAGE_TYPES.WEDDING_NIKKAH || type === COVERAGE_TYPES.WEDDING_DAY) ? 1 : 0 },
      { id: 'candid_cinematographer', selected: type === COVERAGE_TYPES.WEDDING_NIKKAH || type === COVERAGE_TYPES.WEDDING_DAY, quantity: (type === COVERAGE_TYPES.WEDDING_NIKKAH || type === COVERAGE_TYPES.WEDDING_DAY) ? 1 : 0 },
    ],
  }
}

export function createEmptyQuotation(company = 'naj') {
  if (company === 'fewdays') {
    return {
      company: 'fewdays',
      clientName: 'Safwan',
      events: [
        {
          id: '1',
          name: 'Mehandi Night',
          services: ['1 Traditional Photographer', '1 Traditional Cinematographer'],
        },
        {
          id: '2',
          name: 'Wedding Day',
          services: ['1 Traditional Photographer', '1 Traditional Cinematographer'],
        },
      ],
      deliverables: [
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
      price: 119000,
      completed: true,
    }
  }

  if (company === 'litheads') {
    return {
      clientName: '',
      greeting: '',
      clientType: CLIENT_TYPES.BOTH,
      groomName: '',
      brideName: '',
      package: PACKAGES.WITH_ALBUM,
      packageTitle: 'Wedding package for October 8th & 9th',
      price: '75,000',
      services: buildPresetServices(PACKAGES.WITH_ALBUM, 'litheads'),
      coverages: [
        {
          id: generateUUID(),
          type: COVERAGE_TYPES.CUSTOM,
          customName: 'Mehandi night',
          month: 'October',
          day: 8,
          date: 'Oct 8th',
          side: COVERAGE_SIDES.BOTH,
          roles: [
            { id: 'photographer', selected: true, quantity: 1 },
            { id: 'videographer', selected: true, quantity: 1 },
          ],
        },
        {
          id: generateUUID(),
          type: COVERAGE_TYPES.CUSTOM,
          customName: 'Wedding day',
          month: 'October',
          day: 9,
          date: 'Oct 9th',
          side: COVERAGE_SIDES.BOTH,
          roles: [
            { id: 'photographer', selected: true, quantity: 1 },
            { id: 'videographer', selected: true, quantity: 1 },
          ],
        },
      ],
      completed: false,
      company: 'litheads',
    }
  }

  return {
    clientType: CLIENT_TYPES.BOTH,
    groomName: '',
    brideName: '',
    package: PACKAGES.WITH_ALBUM,
    packageTitle: '',
    price: '',
    services: buildPresetServices(PACKAGES.WITH_ALBUM, company),
    coverages: [],
    completed: false,
    company,
  }
}

export function getServiceDisplayName(serviceId, photoQuantity, leafCount) {
  const allServices = [...SERVICES, ...PIKTORIA_SERVICES, ...LITHE_ADS_SERVICES]
  const service = allServices.find((s) => s.id === serviceId)
  if (!service) return ''
  if (service.hasPhotoQuantity && photoQuantity) {
    return `${photoQuantity} ${service.name}`
  }
  if (serviceId === 'wedding_album_80p') {
    const leaves = leafCount || 40
    return `${leaves * 2} Pages Wedding Album`
  }
  if (service.hasLeafCount || serviceId === 'piktoria_album' || serviceId === 'premium_album') {
    const leaves = leafCount || service.defaultLeaves || (serviceId === 'piktoria_album' ? 40 : 30)
    if (serviceId === 'piktoria_album') {
      return `${leaves}-Leaf Wedding Album`
    }
    if (serviceId === 'premium_album') {
      return `${leaves} Leaf Premium Album`
    }
  }
  return service.name
}

export function getSelectedServices(services) {
  if (!Array.isArray(services)) return []
  return services
    .filter((s) => s.selected && s.quantity > 0)
    .map((s) => ({
      ...s,
      displayName: s.customTitle || getServiceDisplayName(s.id, s.photoQuantity, s.leafCount),
    }))
}

export function getCoverageLabel(coverage) {
  if (coverage.type === COVERAGE_TYPES.CUSTOM) return coverage.customName?.trim() || 'Custom Event'
  return COVERAGE_LABELS[coverage.type] || coverage.type
}

export function getActiveRoles(coverage) {
  return coverage.roles.filter((r) => r.selected && r.quantity > 0)
}

export function groupCoveragesBySide(coverages = []) {
  const brideCoverages = coverages.filter((c) => (c.side || COVERAGE_SIDES.BRIDE) === COVERAGE_SIDES.BRIDE)
  const groomCoverages = coverages.filter((c) => c.side === COVERAGE_SIDES.GROOM)
  const combinedCoverages = coverages.filter((c) => c.side === COVERAGE_SIDES.BOTH)

  return {
    bride: brideCoverages,
    groom: groomCoverages,
    both: combinedCoverages,
  }
}
