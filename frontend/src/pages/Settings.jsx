import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Settings.css";

const DEFAULT_SETTINGS = {
  businessName: "EBMS PRO",
  businessEmail: "",
  businessPhone: "",
  businessAddress: "",
  website: "",
  taxId: "",

  currency: "USD",
  timezone: "America/New_York",
  dateFormat: "MM/DD/YYYY",
  lowStockThreshold: 10,

  emailNotifications: true,
  lowStockAlerts: true,
  salesAlerts: true,
  purchaseAlerts: true,

  theme: "light",
  accentColor: "blue",
  compactMode: false,
};

export default function Settings() {
  const { user } = useAuth();

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] =
    useState(DEFAULT_SETTINGS);

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const storedSettings =
      localStorage.getItem("ebms-settings");

    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);

        const mergedSettings = {
          ...DEFAULT_SETTINGS,
          ...parsedSettings,
        };

        setSettings(mergedSettings);
        setSavedSettings(mergedSettings);
      } catch (error) {
        console.error(
          "Failed to read saved settings:",
          error
        );
      }
    }
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setSettings((currentSettings) => ({
      ...currentSettings,
      [name]: type === "checkbox" ? checked : value,
    }));

    setMessage("");
  };

  const handleSave = (event) => {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    const normalizedSettings = {
      ...settings,
      lowStockThreshold: Number(
        settings.lowStockThreshold
      ),
    };

    localStorage.setItem(
      "ebms-settings",
      JSON.stringify(normalizedSettings)
    );

    setSettings(normalizedSettings);
    setSavedSettings(normalizedSettings);

    window.setTimeout(() => {
      setSaving(false);
      setMessage("Settings saved successfully.");
    }, 500);
  };

  const handleResetForm = () => {
    setSettings(savedSettings);
    setMessage("Unsaved changes were removed.");
  };

  const handleRestoreDefaults = () => {
    const confirmed = window.confirm(
      "Restore all settings to their default values?"
    );

    if (!confirmed) return;

    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem(
      "ebms-settings",
      JSON.stringify(DEFAULT_SETTINGS)
    );

    setSavedSettings(DEFAULT_SETTINGS);
    setMessage("Default settings restored.");
  };

  const hasUnsavedChanges =
    JSON.stringify(settings) !==
    JSON.stringify(savedSettings);

  return (
    <main className="settings-page">
      <section className="settings-header">
        <div>
          <p className="settings-eyebrow">
            System Administration
          </p>

          <h1>Settings</h1>

          <p className="settings-subtitle">
            Manage your business profile, system preferences,
            inventory rules, and notification settings.
          </p>
        </div>

        <div className="settings-header-status">
          <span className="settings-status-dot"></span>

          <div>
            <strong>System Configuration</strong>
            <small>
              {hasUnsavedChanges
                ? "Unsaved changes"
                : "All changes saved"}
            </small>
          </div>
        </div>
      </section>

      {message && (
        <div className="settings-message">
          {message}
        </div>
      )}

      <form
        className="settings-form"
        onSubmit={handleSave}
      >
        <section className="settings-grid">
          <SettingsCard
            icon="🏢"
            title="Business Profile"
            description="Company and contact information."
          >
            <div className="settings-field-grid">
              <FormField
                label="Business Name"
                name="businessName"
                value={settings.businessName}
                onChange={handleChange}
                placeholder="Enter business name"
                required
              />

              <FormField
                label="Business Email"
                name="businessEmail"
                type="email"
                value={settings.businessEmail}
                onChange={handleChange}
                placeholder="business@example.com"
              />

              <FormField
                label="Phone Number"
                name="businessPhone"
                value={settings.businessPhone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />

              <FormField
                label="Website"
                name="website"
                value={settings.website}
                onChange={handleChange}
                placeholder="https://example.com"
              />

              <FormField
                label="Tax ID"
                name="taxId"
                value={settings.taxId}
                onChange={handleChange}
                placeholder="Enter tax ID"
              />

              <div className="settings-form-group settings-full-width">
                <label htmlFor="businessAddress">
                  Business Address
                </label>

                <textarea
                  id="businessAddress"
                  name="businessAddress"
                  rows="3"
                  value={settings.businessAddress}
                  onChange={handleChange}
                  placeholder="Enter the business address"
                />
              </div>
            </div>
          </SettingsCard>

          <SettingsCard
            icon="👤"
            title="User Account"
            description="Signed-in user information."
          >
            <div className="account-summary">
              <div className="account-avatar">
                {getInitial(user?.name || user?.email)}
              </div>

              <div>
                <h3>{user?.name || "Administrator"}</h3>
                <p>{user?.email || "No email available"}</p>

                <span className="account-role">
                  {user?.role || "User"}
                </span>
              </div>
            </div>

            <div className="account-information">
              <div>
                <span>Account Name</span>
                <strong>
                  {user?.name || "Not available"}
                </strong>
              </div>

              <div>
                <span>Email Address</span>
                <strong>
                  {user?.email || "Not available"}
                </strong>
              </div>

              <div>
                <span>System Role</span>
                <strong>
                  {user?.role || "Not available"}
                </strong>
              </div>
            </div>

            <p className="settings-information-note">
              User account changes and password updates will be
              connected to the authentication API later.
            </p>
          </SettingsCard>

          <SettingsCard
            icon="🌍"
            title="Regional Preferences"
            description="Currency, time zone, and date formatting."
          >
            <div className="settings-field-grid">
              <div className="settings-form-group">
                <label htmlFor="currency">
                  Currency
                </label>

                <select
                  id="currency"
                  name="currency"
                  value={settings.currency}
                  onChange={handleChange}
                >
                  <option value="USD">
                    USD — US Dollar
                  </option>

                  <option value="EUR">
                    EUR — Euro
                  </option>

                  <option value="GBP">
                    GBP — British Pound
                  </option>

                  <option value="ETB">
                    ETB — Ethiopian Birr
                  </option>

                  <option value="CAD">
                    CAD — Canadian Dollar
                  </option>
                </select>
              </div>

              <div className="settings-form-group">
                <label htmlFor="timezone">
                  Time Zone
                </label>

                <select
                  id="timezone"
                  name="timezone"
                  value={settings.timezone}
                  onChange={handleChange}
                >
                  <option value="America/New_York">
                    Eastern Time
                  </option>

                  <option value="America/Chicago">
                    Central Time
                  </option>

                  <option value="America/Denver">
                    Mountain Time
                  </option>

                  <option value="America/Los_Angeles">
                    Pacific Time
                  </option>

                  <option value="Africa/Addis_Ababa">
                    Addis Ababa
                  </option>

                  <option value="UTC">
                    Coordinated Universal Time
                  </option>
                </select>
              </div>

              <div className="settings-form-group">
                <label htmlFor="dateFormat">
                  Date Format
                </label>

                <select
                  id="dateFormat"
                  name="dateFormat"
                  value={settings.dateFormat}
                  onChange={handleChange}
                >
                  <option value="MM/DD/YYYY">
                    MM/DD/YYYY
                  </option>

                  <option value="DD/MM/YYYY">
                    DD/MM/YYYY
                  </option>

                  <option value="YYYY-MM-DD">
                    YYYY-MM-DD
                  </option>
                </select>
              </div>
            </div>
          </SettingsCard>

          <SettingsCard
            icon="📦"
            title="Inventory Settings"
            description="Configure inventory warning levels."
          >
            <div className="settings-form-group">
              <label htmlFor="lowStockThreshold">
                Low Stock Threshold
              </label>

              <input
                id="lowStockThreshold"
                type="number"
                name="lowStockThreshold"
                min="0"
                step="1"
                value={settings.lowStockThreshold}
                onChange={handleChange}
              />

              <small>
                Products at or below this quantity will be marked
                as low stock.
              </small>
            </div>

            <div className="inventory-threshold-preview">
              <span>Current threshold</span>

              <strong>
                {settings.lowStockThreshold} units
              </strong>
            </div>
          </SettingsCard>

          <SettingsCard
            icon="🔔"
            title="Notifications"
            description="Select the alerts you want to receive."
          >
            <div className="settings-toggle-list">
              <ToggleSetting
                label="Email Notifications"
                description="Receive system notifications by email."
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleChange}
              />

              <ToggleSetting
                label="Low Stock Alerts"
                description="Receive alerts when inventory is running low."
                name="lowStockAlerts"
                checked={settings.lowStockAlerts}
                onChange={handleChange}
              />

              <ToggleSetting
                label="Sales Alerts"
                description="Receive notifications for sales activity."
                name="salesAlerts"
                checked={settings.salesAlerts}
                onChange={handleChange}
              />

              <ToggleSetting
                label="Purchase Alerts"
                description="Receive notifications for purchase activity."
                name="purchaseAlerts"
                checked={settings.purchaseAlerts}
                onChange={handleChange}
              />
            </div>
          </SettingsCard>

          <SettingsCard
            icon="🎨"
            title="Appearance"
            description="Customize the visual presentation."
          >
            <div className="settings-field-grid">
              <div className="settings-form-group">
                <label htmlFor="theme">Theme</label>

                <select
                  id="theme"
                  name="theme"
                  value={settings.theme}
                  onChange={handleChange}
                >
                  <option value="light">
                    Light Theme
                  </option>

                  <option value="dark">
                    Dark Theme
                  </option>

                  <option value="system">
                    Use System Setting
                  </option>
                </select>
              </div>

              <div className="settings-form-group">
                <label htmlFor="accentColor">
                  Accent Color
                </label>

                <select
                  id="accentColor"
                  name="accentColor"
                  value={settings.accentColor}
                  onChange={handleChange}
                >
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="purple">
                    Purple
                  </option>
                  <option value="orange">
                    Orange
                  </option>
                </select>
              </div>
            </div>

            <ToggleSetting
              label="Compact Layout"
              description="Reduce spacing to display more information."
              name="compactMode"
              checked={settings.compactMode}
              onChange={handleChange}
            />

            <p className="settings-information-note">
              Appearance preferences are saved now. Applying a
              full dark theme across every page can be added in a
              later enhancement.
            </p>
          </SettingsCard>
        </section>

        <section className="settings-actions">
          <div>
            <strong>
              {hasUnsavedChanges
                ? "You have unsaved changes."
                : "Your settings are up to date."}
            </strong>

            <p>
              Save your changes before leaving this page.
            </p>
          </div>

          <div className="settings-action-buttons">
            <button
              type="button"
              className="settings-default-button"
              onClick={handleRestoreDefaults}
            >
              Restore Defaults
            </button>

            <button
              type="button"
              className="settings-reset-button"
              onClick={handleResetForm}
              disabled={!hasUnsavedChanges}
            >
              Cancel Changes
            </button>

            <button
              type="submit"
              className="settings-save-button"
              disabled={saving || !hasUnsavedChanges}
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </section>
      </form>
    </main>
  );
}

function SettingsCard({
  icon,
  title,
  description,
  children,
}) {
  return (
    <article className="settings-card">
      <div className="settings-card-header">
        <span className="settings-card-icon">
          {icon}
        </span>

        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      <div className="settings-card-body">
        {children}
      </div>
    </article>
  );
}

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div className="settings-form-group">
      <label htmlFor={name}>{label}</label>

      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

function ToggleSetting({
  label,
  description,
  name,
  checked,
  onChange,
}) {
  return (
    <label className="settings-toggle-row">
      <div>
        <strong>{label}</strong>
        <p>{description}</p>
      </div>

      <span className="settings-switch">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
        />

        <span className="settings-slider"></span>
      </span>
    </label>
  );
}

function getInitial(value) {
  if (!value) return "A";

  return String(value)
    .trim()
    .charAt(0)
    .toUpperCase();
}