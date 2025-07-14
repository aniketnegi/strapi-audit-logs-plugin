import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import LogsPage from '../pages/Logs';
import SettingsPage from '../pages/Settings';

/**
 * All React-Router paths are **relative** to `/plugins/<your-plugin-id>`.
 *   • “/”         →   Logs list
 *   • “/settings” →   Settings screen
 * Any other path redirects back to the root.
 */
const PluginRoutes = () => (
  <Routes>
    {/* default → `/plugins/<id>` */}
    <Route index element={<LogsPage />} />

    {/* `/plugins/<id>/settings` */}
    <Route path="settings" element={<SettingsPage />} />

    {/* catch-all → redirect */}
    <Route path="*" element={<Navigate to="." replace />} />
  </Routes>
);

export default PluginRoutes;
