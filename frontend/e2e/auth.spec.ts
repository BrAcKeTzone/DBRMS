import { test, expect } from "@playwright/test";

test.describe("Auth flows (UI + mocked API)", () => {
  test("Signup -> Login -> Forgot Password flows", async ({ page }) => {
    // Intercept send-otp (signup)
    await page.route("**/auth/send-otp", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { message: "OTP sent" } }),
      });
    });

    // Intercept verify-otp
    await page.route("**/auth/verify-otp", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { verified: true } }),
      });
    });

    // Intercept register
    await page.route("**/auth/register", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            user: {
              id: 999,
              email: "e2e@test",
              firstName: "E2E",
              lastName: "User",
              role: "PARENT_GUARDIAN",
            },
            token: "e2e-token",
          },
        }),
      });
    });

    // Start signup flow
    await page.goto("/signup");
    await page.fill('input[name="email"]', "e2e@test");
    await page.click('button:has-text("Send OTP")');
    await expect(page.locator("text=Step 2 of 3")).toBeVisible();

    // Enter OTP and continue
    await page.fill('input[name="otp"]', "123456");
    await page.click('button:has-text("Verify OTP")');
    await expect(page.locator("text=Step 3 of 3")).toBeVisible();

    // Fill personal details
    await page.fill('input[name="firstName"]', "E2E");
    await page.fill('input[name="lastName"]', "User");
    await page.fill('input[name="phone"]', "+1234567890");
    await page.fill('input[name="password"]', "password123");
    await page.fill('input[name="confirmPassword"]', "password123");
    await page.click('button:has-text("Create Account")');

    await expect(page.locator("text=Congratulations!")).toBeVisible();

    // Intercept login
    await page.route("**/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            user: {
              id: 999,
              email: "e2e@test",
              firstName: "E2E",
              lastName: "User",
              role: "PARENT_GUARDIAN",
            },
            token: "e2e-token",
          },
        }),
      });
    });

    // Go to signin and login
    await page.goto("/signin");
    await page.fill('input[name="email"]', "e2e@test");
    await page.fill('input[name="password"]', "password123");
    await page.click('button:has-text("Login")');

    // Expect redirect to parent dashboard
    await expect(page).toHaveURL(/parent/);

    // Forgot password flow
    await page.route("**/auth/send-otp-reset", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { message: "OTP sent" } }),
      });
    });

    await page.route("**/auth/verify-otp-reset", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { verified: true } }),
      });
    });

    await page.route("**/auth/reset-password", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: { message: "Password reset successfully." },
        }),
      });
    });

    await page.goto("/forgot-password");
    await page.fill('input[name="email"]', "e2e@test");
    await page.click('button:has-text("Send Reset Code")');
    await expect(page.locator("text=Step 2 of 3")).toBeVisible();

    await page.fill('input[name="otp"]', "123456");
    await page.click('button:has-text("Verify Code")');
    await expect(page.locator("text=Step 3 of 3")).toBeVisible();

    await page.fill('input[name="newPassword"]', "newpass123");
    await page.fill('input[name="confirmPassword"]', "newpass123");
    await page.click('button:has-text("Reset Password")');

    await expect(page.locator("text=Password Reset Successful!")).toBeVisible();
  });
});
