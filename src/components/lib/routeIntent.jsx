/**
 * Route Intent Classification
 * Defines which pages should render as pure public marketing pages
 * without authenticated UI chrome (sidebar, navigation, onboarding)
 */

/**
 * Pages that should always render as clean public marketing pages
 * regardless of authentication state
 */
export const PUBLIC_PAGE_NAMES = ['Landing'];

/**
 * Determines if a page should render with PublicLayout
 * @param {string} currentPageName - The name of the current page
 * @returns {boolean} - True if page should use PublicLayout
 */
export function isPublicIntentPage(currentPageName) {
  return PUBLIC_PAGE_NAMES.includes(currentPageName);
}