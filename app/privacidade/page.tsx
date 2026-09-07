import { MobileContainer } from '@/components/mobile-container';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacidadePage() {
  return (
    <MobileContainer>
      <div className="px-6 pt-8 pb-12">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <h1 className="text-xl font-display font-bold mb-4">Política de Privacidade</h1>
        <div className="prose prose-sm text-foreground/90 space-y-4">
          <p className="text-sm leading-relaxed">O <strong>Momento com Deus</strong> valoriza a privacidade de seus usuários.</p>
          <h3 className="text-sm font-semibold">1. Dados coletados</h3>
          <p className="text-sm leading-relaxed">Coletamos apenas as informações necessárias para o funcionamento do aplicativo: nome, email, preferências de uso e registros do diário pessoal.</p>
          <h3 className="text-sm font-semibold">2. Uso dos dados</h3>
          <p className="text-sm leading-relaxed">Seus dados são utilizados exclusivamente para personalizar sua experiência no aplicativo. Não compartilhamos informações pessoais com terceiros.</p>
          <h3 className="text-sm font-semibold">3. Diário pessoal</h3>
          <p className="text-sm leading-relaxed">Suas reflexões e anotações são armazenadas de forma segura e são acessíveis apenas por você.</p>
          <h3 className="text-sm font-semibold">4. Segurança</h3>
          <p className="text-sm leading-relaxed">Utilizamos criptografia e práticas de segurança para proteger seus dados.</p>
          <h3 className="text-sm font-semibold">5. Contato</h3>
          <p className="text-sm leading-relaxed">Para dúvidas sobre privacidade, entre em contato através do aplicativo.</p>
        </div>
      </div>
    </MobileContainer>
  );
}
