// Phone mask utilities for different countries

export interface PhoneMaskConfig {
  mask: string;
  placeholder: string;
  maxLength: number;
}

// Phone masks by country code
const PHONE_MASKS: Record<string, PhoneMaskConfig> = {
  BR: {
    mask: '(##) #####-####',
    placeholder: '(11) 99999-9999',
    maxLength: 15,
  },
  US: {
    mask: '(###) ###-####',
    placeholder: '(202) 555-1234',
    maxLength: 14,
  },
  CA: {
    mask: '(###) ###-####',
    placeholder: '(416) 555-1234',
    maxLength: 14,
  },
  PT: {
    mask: '### ### ###',
    placeholder: '912 345 678',
    maxLength: 11,
  },
  ES: {
    mask: '### ### ###',
    placeholder: '612 345 678',
    maxLength: 11,
  },
  IT: {
    mask: '### ### ####',
    placeholder: '312 345 6789',
    maxLength: 12,
  },
  DE: {
    mask: '#### #######',
    placeholder: '1512 3456789',
    maxLength: 12,
  },
  FR: {
    mask: '## ## ## ## ##',
    placeholder: '06 12 34 56 78',
    maxLength: 14,
  },
  GB: {
    mask: '#### ######',
    placeholder: '7911 123456',
    maxLength: 11,
  },
  AR: {
    mask: '## ####-####',
    placeholder: '11 2345-6789',
    maxLength: 12,
  },
  MX: {
    mask: '## #### ####',
    placeholder: '55 1234 5678',
    maxLength: 12,
  },
  CO: {
    mask: '### ### ####',
    placeholder: '300 123 4567',
    maxLength: 12,
  },
  CL: {
    mask: '# #### ####',
    placeholder: '9 1234 5678',
    maxLength: 11,
  },
  PE: {
    mask: '### ### ###',
    placeholder: '912 345 678',
    maxLength: 11,
  },
  JP: {
    mask: '###-####-####',
    placeholder: '090-1234-5678',
    maxLength: 13,
  },
  AU: {
    mask: '### ### ###',
    placeholder: '412 345 678',
    maxLength: 11,
  },
};

// Get phone mask config for a country
export const getPhoneMaskConfig = (countryCode: string): PhoneMaskConfig => {
  return PHONE_MASKS[countryCode] || {
    mask: '##########',
    placeholder: '1234567890',
    maxLength: 15,
  };
};

// Apply mask to phone number
export const applyPhoneMask = (value: string, countryCode: string): string => {
  const config = getPhoneMaskConfig(countryCode);
  const digits = value.replace(/\D/g, '');
  let masked = '';
  let digitIndex = 0;

  for (let i = 0; i < config.mask.length && digitIndex < digits.length; i++) {
    if (config.mask[i] === '#') {
      masked += digits[digitIndex];
      digitIndex++;
    } else {
      masked += config.mask[i];
    }
  }

  return masked;
};

// Remove mask from phone number (get only digits)
export const removePhoneMask = (value: string): string => {
  return value.replace(/\D/g, '');
};

// Validate phone number length for country
export const validatePhoneLength = (
  value: string,
  countryCode: string,
  rules: { min: number; max: number }
): boolean => {
  const digits = removePhoneMask(value);
  return digits.length >= rules.min && digits.length <= rules.max;
};
