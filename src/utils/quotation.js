import {
  CLIENT_TYPES,
  PACKAGES,
  PACKAGE_PRESETS,
  SERVICES,
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
  const { clientType, groomName, brideName } = quotation
  const groom = groomName?.trim()
  const bride = brideName?.trim()

  if (clientType === CLIENT_TYPES.GROOM) return groom || 'Unnamed'
  if (clientType === CLIENT_TYPES.BRIDE) return bride || 'Unnamed'
  if (groom && bride) return `${groom} & ${bride}`
  return groom || bride || 'Unnamed'
}

export function getPdfFileName(quotation) {
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

export function createServiceSelection(serviceId, quantity = 1) {
  const service = SERVICES.find((s) => s.id === serviceId)
  return {
    id: serviceId,
    selected: true,
    quantity,
    photoQuantity: service?.hasPhotoQuantity ? DEFAULT_PHOTO_QUANTITY : undefined,
  }
}

export function buildPresetServices(packageType) {
  const presetIds = PACKAGE_PRESETS[packageType] || []
  return SERVICES.map((service) => {
    const isSelected = presetIds.includes(service.id)
    return {
      id: service.id,
      selected: isSelected,
      quantity: isSelected ? 1 : 0,
      photoQuantity: service.hasPhotoQuantity ? DEFAULT_PHOTO_QUANTITY : undefined,
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

export function createEmptyCoverage(type = COVERAGE_TYPES.BRIDE_EVE, customName = '', side = null, date = '') {
  const actualSide = side || getDefaultSide(type)
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

export function createEmptyQuotation() {
  return {
    clientType: CLIENT_TYPES.BOTH,
    groomName: '',
    brideName: '',
    package: PACKAGES.WITH_ALBUM,
    price: '',
    services: buildPresetServices(PACKAGES.WITH_ALBUM),
    coverages: [],
    completed: false,
  }
}

export function getServiceDisplayName(serviceId, photoQuantity) {
  const service = SERVICES.find((s) => s.id === serviceId)
  if (!service) return ''
  if (service.hasPhotoQuantity && photoQuantity) {
    return `${photoQuantity} ${service.name}`
  }
  return service.name
}

export function getSelectedServices(services) {
  return services
    .filter((s) => s.selected && s.quantity > 0)
    .map((s) => ({
      ...s,
      displayName: getServiceDisplayName(s.id, s.photoQuantity),
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
