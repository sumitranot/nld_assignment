export interface ProductMetaInfo {
  image: string;
  category: string;
  rating: number;
  reviewsCount: number;
  badge?: string;
}

// Curated high-resolution eCommerce imagery for logistics & warehouse inventory
const SKU_IMAGE_MAP: Record<string, ProductMetaInfo> = {
  // Boxes & Cartons
  'SKU-BOX-SM-001': {
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
    category: 'Boxes & Cartons',
    rating: 4.8,
    reviewsCount: 142,
    badge: 'Popular',
  },
  'SKU-BOX-MD-002': {
    image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
    category: 'Boxes & Cartons',
    rating: 4.9,
    reviewsCount: 230,
    badge: 'Best Seller',
  },
  'SKU-BOX-LG-003': {
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
    category: 'Boxes & Cartons',
    rating: 4.7,
    reviewsCount: 98,
  },
  'SKU-BOX-XL-004': {
    image: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=600&q=80',
    category: 'Boxes & Cartons',
    rating: 4.8,
    reviewsCount: 64,
    badge: 'Heavy Duty',
  },

  // Tapes & Adhesives
  'SKU-TAPE-CLR-005': {
    image: 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?auto=format&fit=crop&w=600&q=80',
    category: 'Tape & Adhesives',
    rating: 4.9,
    reviewsCount: 310,
    badge: 'Bulk Pack',
  },
  'SKU-TAPE-GUN-006': {
    image: 'https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&w=600&q=80',
    category: 'Tape & Adhesives',
    rating: 4.6,
    reviewsCount: 88,
  },

  // Protective Cushioning
  'SKU-WRAP-BUB-007': {
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80',
    category: 'Protective Wrap',
    rating: 4.8,
    reviewsCount: 175,
    badge: 'Fragile Safe',
  },
  'SKU-WRAP-PLT-008': {
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
    category: 'Protective Wrap',
    rating: 4.9,
    reviewsCount: 194,
    badge: 'Warehouse Grade',
  },
  'SKU-FILL-KFT-009': {
    image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
    category: 'Void Fill & Cushioning',
    rating: 4.7,
    reviewsCount: 52,
    badge: 'Eco Friendly',
  },
  'SKU-FILL-PNT-010': {
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
    category: 'Void Fill & Cushioning',
    rating: 4.5,
    reviewsCount: 41,
    badge: '100% Bio',
  },

  // Pallets & Handling
  'SKU-PAL-EUR-011': {
    image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=600&q=80',
    category: 'Pallets & Material Handling',
    rating: 4.9,
    reviewsCount: 115,
    badge: 'EPAL Certified',
  },
  'SKU-PAL-PLS-012': {
    image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=600&q=80',
    category: 'Pallets & Material Handling',
    rating: 4.8,
    reviewsCount: 73,
    badge: 'Hygienic',
  },

  // Labels & Markings
  'SKU-LBL-SHP-013': {
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    category: 'Shipping Labels',
    rating: 4.9,
    reviewsCount: 265,
    badge: 'High Speed',
  },
  'SKU-LBL-FRG-014': {
    image: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=600&q=80',
    category: 'Shipping Labels',
    rating: 4.7,
    reviewsCount: 122,
  },
  'SKU-DOC-WLT-015': {
    image: 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?auto=format&fit=crop&w=600&q=80',
    category: 'Shipping Labels',
    rating: 4.6,
    reviewsCount: 89,
  },

  // Equipment & Tools
  'SKU-EQP-PLT-016': {
    image: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=600&q=80',
    category: 'Warehouse Equipment',
    rating: 5.0,
    reviewsCount: 46,
    badge: '2500kg Load',
  },
  'SKU-EQP-HND-017': {
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
    category: 'Warehouse Equipment',
    rating: 4.8,
    reviewsCount: 81,
  },
  'SKU-EQP-SCL-018': {
    image: 'https://images.unsplash.com/photo-1584267385494-9fdd9a71ad75?auto=format&fit=crop&w=600&q=80',
    category: 'Warehouse Equipment',
    rating: 4.9,
    reviewsCount: 67,
    badge: 'Calibrated',
  },
  'SKU-EQP-SCN-019': {
    image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80',
    category: 'Warehouse Equipment',
    rating: 4.9,
    reviewsCount: 184,
    badge: 'Wireless 2D',
  },
  'SKU-EQP-PRN-020': {
    image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=600&q=80',
    category: 'Warehouse Equipment',
    rating: 4.8,
    reviewsCount: 95,
    badge: 'Direct Thermal',
  },

  // Strapping & Fastening
  'SKU-STP-KIT-021': {
    image: 'https://images.unsplash.com/photo-1586528116493-a029325540fa?auto=format&fit=crop&w=600&q=80',
    category: 'Strapping & Fastening',
    rating: 4.7,
    reviewsCount: 58,
  },
  'SKU-EDG-CRN-022': {
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
    category: 'Strapping & Fastening',
    rating: 4.6,
    reviewsCount: 39,
  },

  // Cutters & Blades
  'SKU-CUT-UTL-023': {
    image: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=600&q=80',
    category: 'Tools & Cutters',
    rating: 4.8,
    reviewsCount: 210,
    badge: 'Safety Auto-Lock',
  },
  'SKU-CUT-BLD-024': {
    image: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=600&q=80',
    category: 'Tools & Cutters',
    rating: 4.9,
    reviewsCount: 160,
  },

  // Safety & Facility
  'SKU-SFT-VST-025': {
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80',
    category: 'Safety & Facility',
    rating: 4.8,
    reviewsCount: 130,
    badge: 'EN ISO 20471',
  },
  'SKU-SFT-GLV-026': {
    image: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=600&q=80',
    category: 'Safety & Facility',
    rating: 4.9,
    reviewsCount: 220,
    badge: 'Cut Resistant',
  },
  'SKU-SEC-LCK-027': {
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
    category: 'Safety & Facility',
    rating: 4.7,
    reviewsCount: 75,
  },
  'SKU-STR-BIN-028': {
    image: 'https://images.unsplash.com/photo-1595079672139-62725d2b79a5?auto=format&fit=crop&w=600&q=80',
    category: 'Storage & Bins',
    rating: 4.8,
    reviewsCount: 110,
    badge: 'Stackable',
  },
  'SKU-DSC-SIL-029': {
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    category: 'Storage & Bins',
    rating: 4.6,
    reviewsCount: 92,
  },
  'SKU-BAG-PLY-030': {
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
    category: 'Boxes & Cartons',
    rating: 4.7,
    reviewsCount: 145,
    badge: 'Waterproof',
  },
};

// Fallback category images for custom / newly-created admin products
const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  box: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
  tape: 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?auto=format&fit=crop&w=600&q=80',
  wrap: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80',
  pallet: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=600&q=80',
  label: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
  scanner: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80',
  printer: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=600&q=80',
  equipment: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=600&q=80',
  safety: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=600&q=80',
  default: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
};

export const getProductMetadata = (sku: string, name = ''): ProductMetaInfo => {
  if (SKU_IMAGE_MAP[sku]) {
    return SKU_IMAGE_MAP[sku];
  }

  // Fallback matching based on name and sku keywords
  const lower = `${sku} ${name}`.toLowerCase();
  let image = CATEGORY_FALLBACK_IMAGES.default;
  let category = 'Warehouse Supply';

  if (lower.includes('box') || lower.includes('carton')) {
    image = CATEGORY_FALLBACK_IMAGES.box;
    category = 'Boxes & Cartons';
  } else if (lower.includes('tape') || lower.includes('dispenser')) {
    image = CATEGORY_FALLBACK_IMAGES.tape;
    category = 'Tape & Adhesives';
  } else if (lower.includes('wrap') || lower.includes('bubble') || lower.includes('film')) {
    image = CATEGORY_FALLBACK_IMAGES.wrap;
    category = 'Protective Wrap';
  } else if (lower.includes('pallet') || lower.includes('truck')) {
    image = CATEGORY_FALLBACK_IMAGES.pallet;
    category = 'Pallets & Handling';
  } else if (lower.includes('label') || lower.includes('sticker') || lower.includes('wallet')) {
    image = CATEGORY_FALLBACK_IMAGES.label;
    category = 'Shipping Labels';
  } else if (lower.includes('scanner') || lower.includes('scale') || lower.includes('printer')) {
    image = CATEGORY_FALLBACK_IMAGES.scanner;
    category = 'Warehouse Equipment';
  } else if (lower.includes('safety') || lower.includes('glove') || lower.includes('vest')) {
    image = CATEGORY_FALLBACK_IMAGES.safety;
    category = 'Safety & Facility';
  }

  return {
    image,
    category,
    rating: 4.8,
    reviewsCount: 24,
  };
};
