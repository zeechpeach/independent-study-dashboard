/**
 * Feature Flags Configuration
 * 
 * Controls the rollout of new features and layouts.
 * Allows for gradual migration and easy rollback.
 */

export interface FeatureFlags {
  /** Enable new advisor layout structure (Phase 3A migration) */
  advisorLayoutV2: boolean;
}

export const featureFlags: FeatureFlags = {
  // Default to true for new advisor layout structure
  advisorLayoutV2: true,
};

/**
 * Get the current value of a feature flag
 */
export const getFeatureFlag = (flag: keyof FeatureFlags): boolean => {
  return featureFlags[flag];
};

/**
 * Check if advisor layout V2 is enabled
 */
export const isAdvisorLayoutV2Enabled = (): boolean => {
  return getFeatureFlag('advisorLayoutV2');
};