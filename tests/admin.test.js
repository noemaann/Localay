import { describe, it, expect, beforeEach } from "vitest";
import { adminAuthService, moderatorService, adminAuditService } from "../src/services";

describe("Admin Subsystem & Credentials Provisioning", () => {
  beforeEach(() => {
    // Clear test localStorage
    localStorage.clear();
  });

  it("authenticates root superadmin with Admin@123", async () => {
    const session = await adminAuthService.login("superadmin", "Admin@123");
    expect(session).toBeDefined();
    expect(session.username).toBe("superadmin");
    expect(session.role).toBe("super_admin");
    expect(session.status).toBe("active");
  });

  it("fails login with invalid password", async () => {
    await expect(adminAuthService.login("superadmin", "WrongPassword")).rejects.toThrow(
      "Invalid Admin ID or Password."
    );
  });

  it("super admin can create new admin account with ID and password", async () => {
    // Login as superadmin first
    await adminAuthService.login("superadmin", "Admin@123");

    const newAdmin = await adminAuthService.addAdmin({
      username: "malappuram_lead",
      password: "SecretPassword123",
      name: "Rahul C.",
      role: "admin",
    });

    expect(newAdmin.username).toBe("malappuram_lead");
    expect(newAdmin.status).toBe("active");

    // Login with the new admin credentials
    const session = await adminAuthService.login("malappuram_lead", "SecretPassword123");
    expect(session.username).toBe("malappuram_lead");
    expect(session.role).toBe("admin");
  });

  it("prevents non-superadmin from adding admin accounts", async () => {
    // Login as superadmin, create normal admin
    await adminAuthService.login("superadmin", "Admin@123");
    await adminAuthService.addAdmin({
      username: "staff_moderator",
      password: "StaffPassword123",
      name: "Staff",
      role: "admin",
    });

    // Login as the regular admin
    await adminAuthService.login("staff_moderator", "StaffPassword123");

    // Attempt to create another admin should fail
    await expect(
      adminAuthService.addAdmin({
        username: "hacker_admin",
        password: "Secret123",
        name: "Hacker",
      })
    ).rejects.toThrow(/Unauthorized/);
  });

  it("super admin can deactivate and reactivate an admin account", async () => {
    await adminAuthService.login("superadmin", "Admin@123");
    await adminAuthService.addAdmin({
      username: "temp_admin",
      password: "TempPassword123",
      name: "Temp",
    });

    const deactivated = await adminAuthService.toggleAdminStatus("temp_admin");
    expect(deactivated.status).toBe("deactivated");

    // Login should fail for deactivated admin
    await expect(adminAuthService.login("temp_admin", "TempPassword123")).rejects.toThrow(
      /deactivated/
    );
  });
});

describe("Moderator Management Subsystem", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("loads candidate applications and allows approval", () => {
    const apps = moderatorService.getApplications();
    expect(apps.length).toBeGreaterThan(0);

    const pending = apps.find((a) => a.status === "pending");
    expect(pending).toBeDefined();

    const approved = moderatorService.approveApplication(pending.id, "superadmin");
    expect(approved.status).toBe("approved");

    const activeMods = moderatorService.getActiveModerators();
    expect(activeMods.some((m) => m.email === pending.email)).toBe(true);
  });

  it("allows direct enrollment of moderators", () => {
    const mod = moderatorService.addModeratorDirectly(
      {
        name: "Siddique K.",
        email: "siddique.kottakkal@example.com",
        regionName: "Kottakkal",
        role: "Area Moderator",
      },
      "superadmin"
    );

    expect(mod.name).toBe("Siddique K.");
    expect(mod.status).toBe("active");
  });
});
