import { test, expect } from "@playwright/test";

test.describe("Auth flows (UI + mocked API)", () => {
  test("Signup -> Login -> Forgot Password flows", async ({ page }) => {
    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
    page.on("request", (req) => console.log("REQ:", req.method(), req.url()));
    page.on("response", (res) => console.log("RESP:", res.status(), res.url()));

    // Global mocks for auth endpoints used in signup/login/forgot flows
    await page.route("**/auth/send-otp", async (route) => {
      console.log("ROUTE: send-otp");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { message: "OTP sent", otp: "123456" } }),
      });
    });

    await page.route("**/auth/verify-otp", async (route) => {
      console.log("ROUTE: verify-otp");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { verified: true } }),
      });
    });

    await page.route("**/auth/register", async (route) => {
      console.log(
        "ROUTE: register, payload:",
        await route.request().postData()
      );
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            user: {
              id: 999,
              email: "e2e@test.com",
              firstName: "E2E",
              lastName: "User",
              role: "PARENT_GUARDIAN",
            },
            token: "e2e-token",
          },
        }),
      });
    });

    // Mocks for password reset
    await page.route("**/auth/send-otp-reset", async (route) => {
      console.log("ROUTE: send-otp-reset");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { message: "OTP sent" } }),
      });
    });

    await page.route("**/auth/verify-otp-reset", async (route) => {
      console.log("ROUTE: verify-otp-reset");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { verified: true } }),
      });
    });

    await page.route("**/auth/reset-password", async (route) => {
      console.log("ROUTE: reset-password");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: { message: "Password reset successfully." },
        }),
      });
    });

    // Start signup flow
    await page.goto("/signup");
    await page.fill('input[name="email"]', "e2e@test.com");
    await page.click('button:has-text("Send OTP")');
    await expect(page.locator("text=Step 2 of 3")).toBeVisible();

    // Enter OTP and continue
    await page.fill('input[name="otp"]', "123456");
    await page.click('button:has-text("Verify OTP")');
    // Ensure verify-otp network call completed and the UI transitioned
    await page.waitForResponse(
      (resp) =>
        resp.url().endsWith("/auth/verify-otp") && resp.status() === 200,
      { timeout: 5000 }
    );
    await expect(page.locator("text=Step 3 of 3")).toBeVisible({
      timeout: 5000,
    });

    // Fill personal details
    await page.fill('input[name="firstName"]', "E2E");
    await page.fill('input[name="lastName"]', "User");
    await page.fill('input[name="phone"]', "+1234567890");
    await page.fill('input[name="password"]', "password123");
    await page.fill('input[name="confirmPassword"]', "password123");

    // Sanity checks before submitting
    await expect(page.locator('button:has-text("Create Account")')).toBeEnabled(
      { timeout: 2000 }
    );

    // Capture a screenshot for debugging
    await page.screenshot({ path: "signup-before-create.png" });

    // Try a direct fetch to the register endpoint to validate our route mock
    const regResp = await page.evaluate(async () => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "e2e@test.com",
            otp: "123456",
            firstName: "E2E",
            lastName: "User",
            phone: "+1234567890",
            password: "password123",
          }),
        });
        const json = await res.json();
        // expose response to test logs
        // @ts-ignore
        console.log("REG-FETCH-RESP", json);
        return { status: res.status, body: json };
      } catch (err) {
        // @ts-ignore
        console.log("REG-FETCH-ERROR", String(err));
        throw err;
      }
    });

    console.log("REG RESP FROM PAGE EVAL:", regResp);

    await page.click('button:has-text("Create Account")');

    // Wait for register network response to ensure server-side success before asserting
    await page.waitForResponse(
      (resp) => resp.url().endsWith("/auth/register") && resp.status() === 201,
      { timeout: 10000 }
    );

    await expect(page.locator("text=Congratulations!")).toBeVisible({
      timeout: 10000,
    });

    // Intercept login
    await page.route("**/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            user: {
              id: 999,
              email: "e2e@test.com",
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
    await page.fill('input[name="email"]', "e2e@test.com");
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
    await page.fill('input[name="email"]', "e2e@test.com");
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

  test("Login uses zustand persist (no legacy localStorage keys)", async ({
    page,
  }) => {
    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
    page.on("request", (req) => console.log("REQ:", req.method(), req.url()));
    page.on("response", (res) => console.log("RESP:", res.status(), res.url()));
    // Mock login response to ensure deterministic behaviour in CI
    await page.route("**/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            user: {
              id: 3,
              email: "parent@demo",
              firstName: "Parent",
              lastName: "Guardian",
              role: "PARENT_GUARDIAN",
            },
            token: "demo-token-3",
          },
        }),
      });
    });

    // Use demo user that exists in src/data/users.json
    await page.goto("/signin");
    await page.fill('input[name="email"]', "parent@demo");
    await page.fill('input[name="password"]', "parent123");
    await page.click('button:has-text("Login")');

    // Ensure login network request is made and succeeded
    await page.waitForResponse(
      (resp) => resp.url().endsWith("/auth/login") && resp.status() === 200,
      { timeout: 10000 }
    );

    // Expect redirect to parent dashboard
    await expect(page).toHaveURL(/parent/, { timeout: 10000 });

    // Expect redirect to parent dashboard
    await expect(page).toHaveURL(/parent/);

    // Ensure legacy keys are not present
    const legacyAuthToken = await page.evaluate(() =>
      localStorage.getItem("authToken")
    );
    const legacyUser = await page.evaluate(() => localStorage.getItem("user"));
    expect(legacyAuthToken).toBeNull();
    expect(legacyUser).toBeNull();

    // Check zustand persist key exists and contains expected user/token
    const authStorageStr = await page.evaluate(() =>
      localStorage.getItem("auth-storage")
    );
    expect(authStorageStr).not.toBeNull();

    const parsed = JSON.parse(authStorageStr || "null");
    // Persist middleware may store an object { state: {...}, version }
    const state = parsed?.state || parsed;
    expect(state).toBeTruthy();
    expect(state.user).toBeTruthy();
    expect(state.user.email).toBe("parent@demo");
    expect(state.token).toBeTruthy();
    expect(state.isAuthenticated).toBe(true);

    // Sign out via UI
    // Open avatar menu and click Sign out
    await page.click('button[title^="Parent"]');
    await page.click('button:has-text("Sign out")');

    // After logout, store state should be cleared
    const postAuthStorageStr = await page.evaluate(() =>
      localStorage.getItem("auth-storage")
    );
    const afterParsed = JSON.parse(postAuthStorageStr || "null");
    const afterState = afterParsed?.state || afterParsed;
    expect(afterState.user).toBeNull();
    expect(afterState.token).toBeNull();
    expect(afterState.isAuthenticated).toBe(false);

    // Legacy keys still not present
    const legacyAuthToken2 = await page.evaluate(() =>
      localStorage.getItem("authToken")
    );
    const legacyUser2 = await page.evaluate(() => localStorage.getItem("user"));
    expect(legacyAuthToken2).toBeNull();
    expect(legacyUser2).toBeNull();
  });
});
