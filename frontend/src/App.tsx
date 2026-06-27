import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/hooks/useAuth";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { HomePage } from "@/pages/HomePage";
import { ArticlePage } from "@/pages/ArticlePage";
import { CategoryPage } from "@/pages/CategoryPage";
import { SearchPage } from "@/pages/SearchPage";
import { AboutPage } from "@/pages/AboutPage";
import { ContactPage } from "@/pages/ContactPage";
import { AdminLoginPage } from "@/pages/AdminLoginPage";
import { AdminDashboardPage } from "@/pages/AdminDashboardPage";
import { AdminPostsPage } from "@/pages/AdminPostsPage";
import { AdminPostEditPage } from "@/pages/AdminPostEditPage";
import { AdminCategoriesPage } from "@/pages/AdminCategoriesPage";
import { AdminMediaPage } from "@/pages/AdminMediaPage";
import { AdminSettingsPage } from "@/pages/AdminSettingsPage";
import { AdminAiAutomationPage } from "@/pages/AdminAiAutomationPage";
import { AdminAdsPage } from "@/pages/AdminAdsPage";
import { AdminSubtopicsPage } from "@/pages/AdminSubtopicsPage";
import { AdminSecondaryTagsPage } from "@/pages/AdminSecondaryTagsPage";
import { AdminDraftsPage } from "@/pages/AdminDraftsPage";
import { AdminContactMessagesPage } from "@/pages/AdminContactMessagesPage";
import { AdminProfilePage } from "@/pages/AdminProfilePage";
import { AdminTelegramBotPage } from "@/pages/AdminTelegramBotPage";
import { AdminAnalyticsPage } from "@/pages/AdminAnalyticsPage";

const ADMIN_BASE_PATH = import.meta.env.VITE_ADMIN_BASE_PATH || "/control/iatomic-panel";
export { ADMIN_BASE_PATH };

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="article/:slug" element={<ArticlePage />} />
              <Route path="category/:slug" element={<CategoryPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
            </Route>
            <Route path={ADMIN_BASE_PATH} element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="posts" element={<AdminPostsPage />} />
              <Route path="drafts" element={<AdminDraftsPage />} />
              <Route path="posts/new" element={<AdminPostEditPage />} />
              <Route path="posts/:id/edit" element={<AdminPostEditPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="subtopics" element={<AdminSubtopicsPage />} />
              <Route path="secondary-tags" element={<AdminSecondaryTagsPage />} />
              <Route path="media" element={<AdminMediaPage />} />
              <Route path="ads" element={<AdminAdsPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="ai-automation" element={<AdminAiAutomationPage />} />
              <Route path="telegram-bot" element={<AdminTelegramBotPage />} />
              <Route path="contact-messages" element={<AdminContactMessagesPage />} />
              <Route path="profile" element={<AdminProfilePage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
            <Route path={`${ADMIN_BASE_PATH}/login`} element={<AdminLoginPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
