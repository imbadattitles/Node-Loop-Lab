const sharedMemoryKinds = ['external', 'heap', 'mixed'];

const profiles = {
  private: {
    mode: 'private',
    isPublic: false,
    memory: {
      defaultConfig: {
        kind: 'external',
        allocationMb: 4,
        intervalMs: 500,
        limitMb: 128,
      },
      kinds: sharedMemoryKinds,
      allocationMb: [1, 2, 4, 8],
      intervalMs: [250, 500, 1000],
      limitMb: [64, 128, 256, 384, 512],
      retainedLimitMb: 512,
      hardRssLimitMb: 768,
      v8HeapLimitMb: 640,
      maxDurationMs: 2 * 60 * 1000,
      deadlineAction: 'pause',
    },
    api: {
      rateLimitsEnabled: false,
      maxConcurrentDemos: Number.POSITIVE_INFINITY,
      maxConcurrentDemosPerIp: Number.POSITIVE_INFINITY,
      maxSseClients: Number.POSITIVE_INFINITY,
    },
  },
  public: {
    mode: 'public',
    isPublic: true,
    memory: {
      defaultConfig: {
        kind: 'external',
        allocationMb: 2,
        intervalMs: 1000,
        limitMb: 64,
      },
      kinds: sharedMemoryKinds,
      allocationMb: [1, 2, 4],
      intervalMs: [500, 1000],
      limitMb: [64, 128, 256],
      retainedLimitMb: 256,
      hardRssLimitMb: 512,
      v8HeapLimitMb: 384,
      maxDurationMs: 60 * 1000,
      deadlineAction: 'stop',
    },
    api: {
      rateLimitsEnabled: true,
      maxConcurrentDemos: 3,
      maxConcurrentDemosPerIp: 1,
      maxSseClients: 60,
      demoRuns: { windowMs: 60 * 1000, max: 20 },
      memoryStarts: { windowMs: 10 * 60 * 1000, max: 4 },
      memoryActions: { windowMs: 60 * 1000, max: 30 },
    },
  },
};

function cloneProfile(profile) {
  return structuredClone(profile);
}

export function getLabProfile(mode) {
  if (mode === 'public' || mode === 'private') {
    return cloneProfile(profiles[mode]);
  }

  return cloneProfile(
    process.env.NODE_ENV === 'production'
      ? profiles.public
      : profiles.private,
  );
}

export const labProfile = getLabProfile(process.env.LAB_MODE);

export function clientLabProfile(profile = labProfile) {
  return {
    mode: profile.mode,
    isPublic: profile.isPublic,
    memory: {
      defaultConfig: profile.memory.defaultConfig,
      options: {
        kinds: profile.memory.kinds,
        allocationMb: profile.memory.allocationMb,
        intervalMs: profile.memory.intervalMs,
        limitMb: profile.memory.limitMb,
      },
      retainedLimitMb: profile.memory.retainedLimitMb,
      hardRssLimitMb: profile.memory.hardRssLimitMb,
      maxDurationMs: profile.memory.maxDurationMs,
      deadlineAction: profile.memory.deadlineAction,
    },
  };
}
