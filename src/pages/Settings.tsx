import { useEffect, useState } from 'react'
import { settingsService, Settings } from '../services/api'
import './Settings.css'

const Settings = () => {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const data = await settingsService.getSettings()
        setSettings(data)
        setError(null)
      } catch (err: any) {
        setError(err.message || 'Failed to load settings')
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleChange = (field: keyof Settings, value: any) => {
    if (!settings) return
    setSettings({ ...settings, [field]: value })
  }

  const handlePreferenceChange = (field: keyof Settings['preferences'], value: boolean) => {
    if (!settings) return
    setSettings({
      ...settings,
      preferences: {
        ...settings.preferences,
        [field]: value,
      },
    })
  }

  const handleSave = async () => {
    if (!settings) return

    try {
      setSaving(true)
      setSaveSuccess(false)
      await settingsService.updateSettings(settings)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="settings-loading">Loading settings...</div>
  }

  if (error && !settings) {
    return <div className="settings-error">Error: {error}</div>
  }

  if (!settings) {
    return <div className="settings-error">No settings available</div>
  }

  return (
    <div className="settings">
      <h1>Settings</h1>
      {error && <div className="settings-error-message">Error: {error}</div>}
      {saveSuccess && <div className="settings-success-message">Settings saved successfully!</div>}
      
      <div className="settings-container">
        <div className="settings-section">
          <h2>Appearance</h2>
          <div className="setting-item">
            <label htmlFor="theme">Theme</label>
            <select
              id="theme"
              value={settings.theme}
              onChange={(e) => handleChange('theme', e.target.value)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h2>Notifications</h2>
          <div className="setting-item">
            <label htmlFor="notifications">
              <input
                type="checkbox"
                id="notifications"
                checked={settings.notifications}
                onChange={(e) => handleChange('notifications', e.target.checked)}
              />
              Enable Notifications
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h2>Localization</h2>
          <div className="setting-item">
            <label htmlFor="language">Language</label>
            <select
              id="language"
              value={settings.language}
              onChange={(e) => handleChange('language', e.target.value)}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
          <div className="setting-item">
            <label htmlFor="timezone">Timezone</label>
            <select
              id="timezone"
              value={settings.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h2>Preferences</h2>
          <div className="setting-item">
            <label htmlFor="emailDigest">
              <input
                type="checkbox"
                id="emailDigest"
                checked={settings.preferences.emailDigest}
                onChange={(e) => handlePreferenceChange('emailDigest', e.target.checked)}
              />
              Email Digest
            </label>
          </div>
          <div className="setting-item">
            <label htmlFor="weeklyReport">
              <input
                type="checkbox"
                id="weeklyReport"
                checked={settings.preferences.weeklyReport}
                onChange={(e) => handlePreferenceChange('weeklyReport', e.target.checked)}
              />
              Weekly Report
            </label>
          </div>
        </div>

        <div className="settings-actions">
          <button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings

