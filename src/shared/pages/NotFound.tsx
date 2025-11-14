import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useTenant } from "@/shared/contexts/TenantContext";
import { Home, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tenant } = useTenant();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        {/* Logo/Brand */}
        <div className="mb-8 flex justify-center">
          {tenant.branding.logo ? (
            <img
              src={tenant.branding.logo}
              alt={tenant.branding.companyName}
              className="h-16 w-auto"
            />
          ) : (
            <div className="text-4xl font-bold bg-gradient-to-r from-[var(--tenant-gradient-from)] via-[var(--tenant-gradient-via)] to-[var(--tenant-gradient-to)] bg-clip-text text-transparent">
              {tenant.branding.companyName}
            </div>
          )}
        </div>

        {/* 404 Animation */}
        <div className="mb-8 relative">
          <div className="text-9xl font-extrabold text-gray-200 dark:text-gray-700 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="w-24 h-24 text-gray-400 dark:text-gray-600 animate-pulse" />
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          Oops! Página não encontrada
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          A página que você está procurando não existe ou foi movida para outro local.
        </p>

        {/* Path Info */}
        <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 inline-block">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Caminho solicitado:</p>
          <code className="text-sm font-mono text-gray-800 dark:text-gray-200 break-all">
            {location.pathname}
          </code>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>

          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(135deg, var(--tenant-gradient-from), var(--tenant-gradient-to))`
            }}
          >
            <Home className="w-5 h-5" />
            Ir para o Início
          </a>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-sm text-gray-500 dark:text-gray-400">
          <p>
            Precisa de ajuda? Entre em contato com{" "}
            <a
              href={`mailto:${tenant.branding.supportEmail}`}
              className="underline hover:text-gray-700 dark:hover:text-gray-300"
            >
              {tenant.branding.supportEmail}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
