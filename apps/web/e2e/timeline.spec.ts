import { test, expect } from '@playwright/test';

test.describe('Timeline Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/timeline');
  });

  test('displays timeline header', async ({ page }) => {
    await expect(page.getByText('الجدول الزمني للأحداث')).toBeVisible();
  });

  test('displays view mode toggles', async ({ page }) => {
    await expect(page.getByRole('button', { name: /أفقي/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /عمودي/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /حسب الفترة/ })).toBeVisible();
  });

  test('switches to vertical view', async ({ page }) => {
    const verticalButton = page.getByRole('button', { name: /عمودي/ });
    await verticalButton.click();

    // Vertical view should be active
    await expect(verticalButton).toHaveClass(/bg-white/);
  });

  test('switches to period view', async ({ page }) => {
    const periodButton = page.getByRole('button', { name: /حسب الفترة/ });
    await periodButton.click();

    // Period headers should be visible
    await expect(page.getByText(/عهد الأمير عبد القادر/)).toBeVisible({ timeout: 5000 });
  });

  test('search filters timeline events', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/ابحث في الأحداث/);
    await searchInput.fill('المقراني');

    await page.waitForTimeout(500); // debounce

    // Results count should update
    await expect(page.getByText(/حدث/)).toBeVisible();
  });

  test('opens filter dropdown', async ({ page }) => {
    const filterButton = page.getByRole('button', { name: /تصفية/ });
    await filterButton.click();

    await expect(page.getByText('تصفية الأحداث')).toBeVisible();
  });

  test('navigates back to map', async ({ page }) => {
    const backButton = page.getByRole('link', { name: /العودة للخريطة/ });
    await backButton.click();

    await expect(page).toHaveURL('/');
  });

  test('map button link is visible', async ({ page }) => {
    await expect(page.getByRole('link', { name: /عرض على الخريطة/ })).toBeVisible();
  });
});

test.describe('Timeline Horizontal View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/timeline');
    // Ensure horizontal view is active (default)
    await page.getByRole('button', { name: /أفقي/ }).click();
  });

  test('displays zoom controls', async ({ page }) => {
    await expect(page.getByRole('button', { name: /تكبير/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /تصغير/ })).toBeVisible();
  });

  test('displays scroll controls', async ({ page }) => {
    await expect(page.getByRole('button', { name: /التمرير يميناً/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /التمرير يساراً/ })).toBeVisible();
  });

  test('displays event type legend', async ({ page }) => {
    await expect(page.getByText('أنواع الأحداث:')).toBeVisible();
    await expect(page.getByText('ثورة')).toBeVisible();
    await expect(page.getByText('معركة')).toBeVisible();
  });
});
