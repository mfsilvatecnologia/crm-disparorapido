/** true só quando o login gravou a marca vinda do banco. Papel `admin` da empresa não conta. */
export function isPlatformAdminUser(user: { platformAdmin?: boolean } | null | undefined): boolean {
  return user?.platformAdmin === true;
}
