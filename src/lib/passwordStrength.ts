export type PasswordStrength = 'weak' | 'medium' | 'strong';

export interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number; // 0-100
  feedback: string[];
}

export function checkPasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return {
      strength: 'weak',
      score: 0,
      feedback: []
    };
  }

  let score = 0;
  const feedback: string[] = [];

  // Length checks
  if (password.length >= 6) score += 10;
  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 10;
  if (password.length < 6) feedback.push('Use at least 6 characters');

  // Character variety checks
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecial = /[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/]/.test(password);

  if (hasLowercase) score += 15;
  else feedback.push('Add lowercase letters');

  if (hasUppercase) score += 15;
  else feedback.push('Add uppercase letters');

  if (hasNumbers) score += 15;
  else feedback.push('Add numbers');

  if (hasSpecial) score += 15;
  else feedback.push('Add special characters (@$!%*?&...)');

  // Pattern checks (bonus points)
  if (password.length >= 8 && hasLowercase && hasUppercase) score += 5;
  if (password.length >= 8 && hasNumbers && hasSpecial) score += 5;
  if (password.length >= 12 && hasLowercase && hasUppercase && hasNumbers && hasSpecial) score += 5;

  // Penalties for common patterns
  if (/12345|abcde|qwerty|password/i.test(password)) {
    score = Math.max(0, score - 20);
    feedback.push('Avoid common patterns');
  }

  // Determine strength
  let strength: PasswordStrength;
  if (score < 40) {
    strength = 'weak';
  } else if (score < 70) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }

  // Cap score at 100
  score = Math.min(100, score);

  return {
    strength,
    score,
    feedback: feedback.length > 0 ? feedback : []
  };
}

