# Migração de hospedagem (Vercel → Abacus.AI)

Regra de ouro: **mantenha a versão atual no ar** até a nova estar 100% testada.

## Antes de começar
- [ ] Confirmar com o suporte da Abacus (support@abacus.ai): qual plano mantém
      um app comercial publicado, e o que acontece se a assinatura atrasar.
- [ ] Confirmar que o projeto roda lá com Next.js 16, Prisma e o banco Neon.
- [ ] Fazer um backup do banco (Neon → Backups / exportação) antes de qualquer teste.

## Passo a passo
1. **Conectar o repositório** `fernandolfas48/Momento-com-Deus` ao agente da
   Abacus. Peça para publicar **sem trocar o banco nem a stack**
   (o arquivo `AGENTS.md` já traz essas regras).
2. **Variáveis de ambiente**: cadastrar no painel da Abacus todas as variáveis
   listadas em `.env.example`, copiando os valores direto do painel da Vercel.
   Nunca cole valores em chats.
   - **`NEXTAUTH_URL`**: usar a URL nova (da Abacus ou o domínio próprio).
3. **Stripe**: no painel do Stripe, criar um **novo endpoint de webhook**
   apontando para `https://URL-NOVA/api/stripe/webhook`, copiar o novo
   segredo para `STRIPE_WEBHOOK_SECRET` na Abacus e **manter o endpoint antigo**
   até validar.
   Eventos usados pelo app: confira em `app/api/stripe/webhook/route.ts`.
4. **Notificações diárias**: agendar uma chamada diária (10h UTC) a
   `GET https://URL-NOVA/api/cron/push-daily` com o cabeçalho
   `Authorization: Bearer <CRON_SECRET>`. Se a Abacus não tiver tarefa
   agendada, usar um agendador externo gratuito (por exemplo, cron-job.org).
5. **Testar tudo na URL nova**:
   - [ ] Cadastro e login
   - [ ] Recuperação de senha (com um e-mail que não seja o seu)
   - [ ] Momento do dia e geração de oração com IA
   - [ ] Gravação de áudio e transcrição
   - [ ] Músicas (`/api/audio`)
   - [ ] Notificação push (ativar em Perfil → Notificações e disparar o cron)
   - [ ] Assinatura e créditos (modo de teste do Stripe)
   - [ ] Painel `/admin`
6. **Virar a chave**: só depois dos testes, trocar o domínio / avisar os usuários.
   Quem já ativou as notificações no endereço antigo precisará ativar de novo
   no novo (a inscrição push fica presa ao endereço do app).
7. Só desligar a Vercel depois de alguns dias com tudo estável.

## Cuidados
- Nunca use `--accept-data-loss` nem apague tabelas do Neon.
- Troque `CRON_SECRET` e chaves antigas se algum valor tiver vazado.
