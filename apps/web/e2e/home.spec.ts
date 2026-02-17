import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays header with title and search', async ({ page }) => {
    await expect(page.getByText('خريطة المقاومات الشعبية')).toBeVisible();
    await expect(page.getByPlaceholder(/ابحث عن ثورة/)).toBeVisible();
  });

  test('displays the map', async ({ page }) => {
    // Wait for map to load
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10000 });
  });

  test('displays events panel', async ({ page }) => {
    await expect(page.getByText('جميع المناطق')).toBeVisible();
  });

  test('search updates events list', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/ابحث عن ثورة/);
    await searchInput.fill('المقراني');

    // Wait for search results
    await page.waitForTimeout(500); // debounce

    // Should show search indicator
    await expect(page.getByText(/نتيجة لـ/)).toBeVisible({ timeout: 5000 });
  });

  test('filter button opens filter panel', async ({ page }) => {
    const filterButton = page.getByRole('button', { name: /تصفية/ });
    await filterButton.click();

    await expect(page.getByText('نوع الحدث')).toBeVisible();
    await expect(page.getByText('الفترة الزمنية')).toBeVisible();
  });

  test('navigates to timeline page', async ({ page }) => {
    const timelineLink = page.getByRole('link', { name: /الجدول الزمني/ });
    await timelineLink.click();

    await expect(page).toHaveURL('/timeline');
    await expect(page.getByText('الجدول الزمني للأحداث')).toBeVisible();
  });

  test('mobile menu opens on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const menuButton = page.getByRole('button', { name: /فتح القائمة/ });
    await menuButton.click();

    await expect(page.getByText('حول المشروع')).toBeVisible();
  });
});

test.describe('Events Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('filters events by type', async ({ page }) => {
    // Open filters
    await page.getByRole('button', { name: /تصفية/ }).click();

    // Click on a type badge to filter
    const revolutionBadge = page.locator('[role="checkbox"]').filter({ hasText: 'ثورة' });
    await revolutionBadge.click();

    // Verify filter is applied
    await expect(revolutionBadge).toHaveAttribute('aria-checked', 'true');
  });

  test('clears filters', async ({ page }) => {
    // Open filters and select a type
    await page.getByRole('button', { name: /تصفية/ }).click();
    await page.locator('[role="checkbox"]').filter({ hasText: 'ثورة' }).click();

    // Clear filters
    await page.getByRole('button', { name: /مسح/ }).click();

    // Verify filters are cleared
    const revolutionBadge = page.locator('[role="checkbox"]').filter({ hasText: 'ثورة' });
    await expect(revolutionBadge).toHaveAttribute('aria-checked', 'false');
  });
});
