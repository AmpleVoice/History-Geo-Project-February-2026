module.exports = {
  ci: {
    collect: {
      // Start server before collecting
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'ready on',
      startServerReadyTimeout: 30000,

      // URLs to audit
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/timeline',
        'http://localhost:3000/login',
      ],

      // Number of runs per URL for more reliable results
      numberOfRuns: 3,

      // Lighthouse settings
      settings: {
        preset: 'desktop',
        // Throttling for consistent results
        throttling: {
          cpuSlowdownMultiplier: 1,
        },
        // Skip certain audits that don't apply
        skipAudits: [
          'uses-http2', // Development server doesn't use HTTP/2
        ],
      },
    },

    assert: {
      // Performance budgets
      assertions: {
        // Performance score thresholds
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],

        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],

        // Resource budgets
        'resource-summary:script:size': ['warn', { maxNumericValue: 500000 }],
        'resource-summary:stylesheet:size': ['warn', { maxNumericValue: 100000 }],
        'resource-summary:image:size': ['warn', { maxNumericValue: 500000 }],
        'resource-summary:total:size': ['warn', { maxNumericValue: 2000000 }],

        // Accessibility requirements
        'color-contrast': 'error',
        'document-title': 'error',
        'html-has-lang': 'error',
        'meta-viewport': 'error',
        'image-alt': 'error',
        'link-name': 'error',
        'button-name': 'error',
        'label': 'error',
      },
    },

    upload: {
      // Target for uploading results (can be changed to LHCI server)
      target: 'temporary-public-storage',
    },
  },
};
