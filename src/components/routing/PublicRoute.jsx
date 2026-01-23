/**
 * PUBLIC ROUTE WRAPPER
 * Allows access without authentication
 */
export default function PublicRoute({ children }) {
  return <>{children}</>;
}