import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('home page has no accessibility violations', async ({ page }) => {
    await page.goto('/');

    // Wait for content to load
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .exclude('.leaflet-container') // Exclude map as it has its own a11y handling
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('timeline page has no accessibility violations', async ({ page }) => {
    await page.goto('/timeline');

    await page.waitForTimeout(1000); // Wait for content

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('login page has no accessibility violations', async ({ page }) => {
    await page.goto('/login');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Keyboard Navigation', () => {
  test('can navigate header with keyboard', async ({ page }) => {
    await page.goto('/');

    // Tab through header elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Search input should be focusable
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'BUTTON', 'A']).toContain(focusedElement);
  });

  test('can navigate events panel with keyboard', async ({ page }) => {
    await page.goto('/');

    // Focus on filter button
    const filterButton = page.getByRole('button', { name: /تصفية/ });
    await filterButton.focus();

    // Press Enter to activate
    await page.keyboard.press('Enter');

    // Filter panel should open
    await expect(page.getByText('نوع الحدث')).toBeVisible();
  });

  test('can navigate timeline with keyboard', async ({ page }) => {
    await page.goto('/timeline');

    // Focus zoom controls
    const zoomInButton = page.getByRole('button', { name: /تكبير/ });
    await zoomInButton.focus();

    // Should be focusable
    await expect(zoomInButton).toBeFocused();
  });

  test('escape key closes modals', async ({ page }) => {
    await page.goto('/login');

    // Mock auth and go to admin
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-token');
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          user: { id: '1', name: 'Admin', role: 'ADMIN' },
          isAuthenticated: true,
        },
      }));
    });
    await page.goto('/admin/events');

    // Open import modal
    await page.getByRole('button', { name: /استيراد/ }).click();
    await expect(page.getByText(/استيراد الأحداث/)).toBeVisible();

    // Press Escape to close
    await page.keyboard.press('Escape');

    // Modal should be closed
    await expect(page.getByText(/استيراد الأحداث/)).not.toBeVisible();
  });
});

test.describe('Focus Management', () => {
  test('focus is trapped in modal', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-token');
      localStorage.setItem('auth-storage', JSON.stringify({
        state: { user: { id: '1', role: 'ADMIN' }, isAuthenticated: true },
      }));
    });
    await page.goto('/admin/events');

    // Open import modal
    await page.getByRole('button', { name: /استيراد/ }).click();

    // Tab multiple times - focus should stay in modal
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
    }

    // Focus should still be within the modal
    const focusedElement = await page.evaluate(() => {
      const active = document.activeElement;
      return active?.closest('[role="dialog"]') !== null ||
             active?.closest('.fixed') !== null;
    });

    expect(focusedElement).toBe(true);
  });

  test('search input clears on Escape', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.getByPlaceholder(/ابحث عن ثورة/);
    await searchInput.fill('test');

    // Press Escape
    await searchInput.press('Escape');

    // Input should be cleared
    await expect(searchInput).toHaveValue('');
  });
});

test.describe('Screen Reader', () => {
  test('page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    const headings = await page.evaluate(() => {
      const h = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      return Array.from(h).map((el) => ({
        level: parseInt(el.tagName.slice(1)),
        text: el.textContent,
      }));
    });

    // Should have at least one h1
    const h1Count = headings.filter((h) => h.level === 1).length;
    expect(h1Count).toBeGreaterThanOrEqual(1);

    // Headings should not skip levels (h1 -> h3 without h2)
    let lastLevel = 0;
    for (const heading of headings) {
      if (lastLevel > 0) {
        expect(heading.level).toBeLessThanOrEqual(lastLevel + 1);
      }
      lastLevel = heading.level;
    }
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/');

    const imagesWithoutAlt = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      return Array.from(images).filter((img) => !img.alt && !img.getAttribute('role')).length;
    });

    expect(imagesWithoutAlt).toBe(0);
  });

  test('buttons have accessible names', async ({ page }) => {
    await page.goto('/');

    const buttonsWithoutLabel = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      return Array.from(buttons).filter((btn) => {
        const hasText = btn.textContent?.trim();
        const hasAriaLabel = btn.getAttribute('aria-label');
        const hasAriaLabelledBy = btn.getAttribute('aria-labelledby');
        return !hasText && !hasAriaLabel && !hasAriaLabelledBy;
      }).length;
    });

    expect(buttonsWithoutLabel).toBe(0);
  });

  test('form inputs have labels', async ({ page }) => {
    await page.goto('/login');

    const inputsWithoutLabel = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input:not([type="hidden"])');
      return Array.from(inputs).filter((input) => {
        const id = input.id;
        const hasLabel = id && document.querySelector(`label[for="${id}"]`);
        const hasAriaLabel = input.getAttribute('aria-label');
        const hasAriaLabelledBy = input.getAttribute('aria-labelledby');
        const hasPlaceholder = input.getAttribute('placeholder');
        return !hasLabel && !hasAriaLabel && !hasAriaLabelledBy && !hasPlaceholder;
      }).length;
    });

    expect(inputsWithoutLabel).toBe(0);
  });
});

test.describe('Color Contrast', () => {
  test('text has sufficient color contrast', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .options({ runOnly: ['color-contrast'] })
      .exclude('.leaflet-container')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('RTL Support', () => {
  test('page has RTL direction', async ({ page }) => {
    await page.goto('/');

    const dir = await page.evaluate(() => document.documentElement.dir);
    expect(dir).toBe('rtl');
  });

  test('text alignment is correct for RTL', async ({ page }) => {
    await page.goto('/');

    const bodyStyle = await page.evaluate(() => {
      return getComputedStyle(document.body).textAlign;
    });

    // Should be right-aligned or start (which is right in RTL)
    expect(['right', 'start', '']).toContain(bodyStyle);
  });
});
