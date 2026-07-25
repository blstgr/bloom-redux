import { DEEPSEEK_API_KEY, PERENUAL_API_KEY, PLANTNET_API_KEY, UNSPLASH_ACCESS_KEY } from '@env';

export function getPerenualApiKey(): string {
  return PERENUAL_API_KEY;
}

export function getPlantNetApiKey(): string {
  return PLANTNET_API_KEY;
}

export function getDeepSeekApiKey(): string {
  return DEEPSEEK_API_KEY;
}

export function getUnsplashAccessKey(): string {
  return UNSPLASH_ACCESS_KEY;
}
