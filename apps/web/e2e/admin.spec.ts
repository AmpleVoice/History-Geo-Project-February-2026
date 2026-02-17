import { test, expect } from '@playwright/test';

test.describe('Admin Authentication', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/admin');

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('displays login form', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByPlaceholder(/البريد الإلكتروني/)).toBeVisible();
    await expect(page.getByPlaceholder(/كلمة المرور/)).toBeVisible();
    await expect(page.getByRole('button', { name: /تسجيل الدخول/ })).toBeVisible();
  });

  test('shows validation errors for empty fields', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: /تسجيل الدخول/ }).click();

    await expect(page.getByText(/البريد الإلكتروني مطلوب/)).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder(/البريد الإلكتروني/).fill('invalid@example.com');
    await page.getByPlaceholder(/كلمة المرور/).fill('wrongpassword');
    await page.getByRole('button', { name: /تسجيل الدخول/ }).click();

    // Should show error message (API will reject)
    await expect(page.getByText(/خطأ|فشل/)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Admin Dashboard (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication by setting localStorage
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-token');
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          user: { id: '1', name: 'Admin', email: 'admin@example.com', role: 'ADMIN' },
          isAuthenticated: true,
        },
      }));
    });
    await page.goto('/admin');
  });

  test('displays dashboard statistics', async ({ page }) => {
    await expect(page.getByText('لوحة التحكم')).toBeVisible();
  });

  test('displays sidebar navigation', async ({ page }) => {
    await expect(page.getByRole('link', { name: /لوحة التحكم/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /الأحداث/ })).toBeVisible();
  });

  test('navigates to events list', async ({ page }) => {
    await page.getByRole('link', { name: /الأحداث/ }).click();

    await expect(page).toHaveURL('/admin/events');
    await expect(page.getByText('الأحداث التاريخية')).toBeVisible();
  });
});

test.describe('Admin Events Management (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-token');
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          user: { id: '1', name: 'Admin', email: 'admin@example.com', role: 'ADMIN' },
          isAuthenticated: true,
        },
      }));
    });
    await page.goto('/admin/events');
  });

  test('displays events table', async ({ page }) => {
    await expect(page.getByText('الأحداث التاريخية')).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('displays add event button', async ({ page }) => {
    await expect(page.getByRole('link', { name: /إضافة حدث/ })).toBeVisible();
  });

  test('displays import/export buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /استيراد/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /تصدير/ })).toBeVisible();
  });

  test('navigates to add event form', async ({ page }) => {
    await page.getByRole('link', { name: /إضافة حدث/ }).click();

    await expect(page).toHaveURL('/admin/events/new');
    await expect(page.getByText(/إنشاء حدث جديد/)).toBeVisible();
  });

  test('search filters events table', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/بحث في الأحداث/);
    await searchInput.fill('المقراني');

    await page.waitForTimeout(500);

    // Table should update (or show no results message)
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('filter dropdown opens', async ({ page }) => {
    await page.getByRole('button', { name: /فلاتر/ }).click();

    await expect(page.getByText('نوع الحدث')).toBeVisible();
    await expect(page.getByText('حالة المراجعة')).toBeVisible();
  });

  test('export dropdown shows options', async ({ page }) => {
    await page.getByRole('button', { name: /تصدير/ }).hover();

    await expect(page.getByText(/تصدير كـ JSON/)).toBeVisible();
    await expect(page.getByText(/تصدير كـ CSV/)).toBeVisible();
  });

  test('import modal opens', async ({ page }) => {
    await page.getByRole('button', { name: /استيراد/ }).click();

    await expect(page.getByText(/استيراد الأحداث/)).toBeVisible();
    await expect(page.getByText(/اسحب وأفلت/)).toBeVisible();
  });
});

test.describe('Admin Event Form (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-token');
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          user: { id: '1', name: 'Admin', email: 'admin@example.com', role: 'ADMIN' },
          isAuthenticated: true,
        },
      }));
    });
    await page.goto('/admin/events/new');
  });

  test('displays event form fields', async ({ page }) => {
    await expect(page.getByLabel(/العنوان/)).toBeVisible();
    await expect(page.getByLabel(/نوع الحدث/)).toBeVisible();
    await expect(page.getByLabel(/تاريخ البداية/)).toBeVisible();
  });

  test('shows validation errors on submit without required fields', async ({ page }) => {
    await page.getByRole('button', { name: /حفظ|إنشاء/ }).click();

    // Should show validation errors
    await expect(page.getByText(/العنوان مطلوب|مطلوب/)).toBeVisible();
  });

  test('cancel button returns to events list', async ({ page }) => {
    await page.getByRole('button', { name: /إلغاء/ }).click();

    await expect(page).toHaveURL('/admin/events');
  });
});
