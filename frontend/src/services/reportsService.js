import { FIXTURE_REPORTS_CATEGORIES } from '../data/fixtures';

export const reportsService = {
  async getCategories() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { data: FIXTURE_REPORTS_CATEGORIES, isFixture: true };
  },
};

