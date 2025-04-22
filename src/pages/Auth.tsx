
import AuthForm from "@/components/auth/AuthForm";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redireciona usuários já autenticados
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full flex flex-col lg:flex-row lg:max-w-5xl">
        {/* Lado esquerdo - Informações (visível apenas em desktop) */}
        <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-center">
          <h1 className="text-4xl font-bold text-primary mb-6">
            Vade Mecânica Pro
          </h1>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-primary-300">
                Acesso Simplificado
              </h3>
              <p className="text-muted-foreground">
                Consulte a legislação de forma rápida e eficiente
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-primary-300">
                Sempre Atualizado
              </h3>
              <p className="text-muted-foreground">
                Conteúdo constantemente atualizado com as últimas alterações
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-primary-300">
                Interface Intuitiva
              </h3>
              <p className="text-muted-foreground">
                Navegue facilmente entre artigos e seções
              </p>
            </div>
          </div>
        </div>

        {/* Lado direito - Formulário */}
        <div className="w-full lg:w-1/2 p-6 lg:p-12">
          <AuthForm />
        </div>
      </div>
    </div>
  );
};

export default Auth;
