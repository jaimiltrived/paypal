import { FIXTURE_AI_INSIGHTS } from '../data/fixtures';

/**
 * Service for AI insights and recommendations.
 */
export const aiService = {
  async getInsights(filters = {}) {
    await new Promise((resolve) => setTimeout(resolve, 140));
    let insights = [...FIXTURE_AI_INSIGHTS];

    if (filters.severity && filters.severity !== 'ALL') {
      insights = insights.filter((i) => i.severity === filters.severity);
    }

    return {
      data: insights,
      total: insights.length,
      isFixture: true,
    };
  },

  async getInsightById(insightId) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const item = FIXTURE_AI_INSIGHTS.find((i) => i.id === insightId);
    if (!item) {
      throw new Error(`Insight ${insightId} not found`);
    }
    return { data: item, isFixture: true };
  },
};

