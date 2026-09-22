import { MobileContainer } from '@/components/mobile-container';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermosPage() {
  return (
    <MobileContainer>
      <div className="px-6 pt-8 pb-12">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <h1 className="text-xl font-display font-bold mb-4">Termos de Uso</h1>
        <div className="prose prose-sm text-foreground/90 space-y-4">
          <p className="text-sm leading-relaxed">Bem-vindo ao <strong>Momento com Deus</strong>. Ao utilizar nosso aplicativo, você concorda com os seguintes termos:</p>
          <h3 className="text-sm font-semibold">1. Sobre o serviço</h3>
          <p className="text-sm leading-relaxed">O Momento com Deus é um aplicativo espiritual que oferece momentos diários de reflexão, oração e leitura bíblica. O conteúdo gerado por inteligência artificial é de caráter espiritual e não substitui aconselhamento profissional.</p>
          <h3 className="text-sm font-semibold">2. Conta do usuário</h3>
          <p className="text-sm leading-relaxed">Você é responsável por manter a confidencialidade de suas credenciais. Cada conta é pessoal e intransferível.</p>
          <h3 className="text-sm font-semibold">3. Conteúdo gerado automaticamente</h3>
          <p className="text-sm leading-relaxed">As orações e reflexões são geradas por inteligência artificial com tom cristão e acolhedor. O aplicativo não fornece aconselhamento médico, psicológico, financeiro ou jurídico.</p>
          <h3 className="text-sm font-semibold">4. Privacidade do diário</h3>
          <p className="text-sm leading-relaxed">Suas reflexões e anotações no diário são privadas e acessíveis apenas por você.</p>
          <h3 className="text-sm font-semibold">5. Alterações</h3>
          <p className="text-sm leading-relaxed">Estes termos podem ser atualizados. Recomendamos que você os revise periodicamente.</p>
        </div>
      </div>
    </MobileContainer>
  );
}
