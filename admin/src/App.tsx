import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { AdminLayout } from './layouts/AdminLayout.js';

// Pages
import { LoginPage } from './pages/LoginPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { ArticlesPage } from './pages/ArticlesPage.js';
import { ArticleEditorPage } from './pages/ArticleEditorPage.js';
import { CategoriesPage } from './pages/CategoriesPage.js';
import { AuthorsPage } from './pages/AuthorsPage.js';
import { MediaPage } from './pages/MediaPage.js';
import { CommentsPage } from './pages/CommentsPage.js';
import { UsersPage } from './pages/UsersPage.js';
import { AnalyticsPage } from './pages/AnalyticsPage.js';
import { SettingsPage } from './pages/SettingsPage.js';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Admin Routes */}
          <Route element={<AdminLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/articles" element={<ArticlesPage />} />
            <Route path="/articles/new" element={<ArticleEditorPage />} />
            <Route path="/articles/:id/edit" element={<ArticleEditorPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/authors" element={<AuthorsPage />} />
            <Route path="/media" element={<MediaPage />} />
            <Route path="/comments" element={<CommentsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
