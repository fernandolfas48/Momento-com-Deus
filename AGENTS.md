# Momento com Deus — instruções para agentes de código

App devocional (orações, momento do dia, diário, áudio, assinatura Premium).
Já está em produção com usuários reais. Seja conservador.

## Stack (NÃO trocar)
- Next.js 16 (App Router), React, TypeScript, Tailwind
- Prisma + PostgreSQL no **Neon** (variável `DATABASE_URL`)
- Autenticação: NextAuth (`auth.ts`)
- Pagamentos: Stripe (assinatura + créditos avulsos)
- E-mail: Resend
- IA: Google AI Studio (Gemini), variável `GOOGLE_AI_API_KEY`
- Notificações: Web Push (`web-push`, `public/sw.js`, tabela `push_subscriptions`)

## Regras importantes
1. **Não troque o banco de dados** nem crie um banco novo. O banco é o Neon e já tem dados reais.
2. **Não use `prisma db push --accept-data-loss`** nem `prisma migrate reset`. Mudanças de schema devem ser apenas aditivas (novas tabelas/colunas opcionais).
3. **Não apague nem recrie dados** (`deleteMany`, `delete`) em seeds ou scripts.
4. **Nunca escreva valores de chaves/segredos no código.** Tudo vem de variáveis de ambiente (veja `.env.example`).
5. **Não troque a stack** (por exemplo, reescrever para outro framework, outra biblioteca de auth ou outro ORM).
6. Em caso de dúvida sobre uma mudança que afete dados, pagamentos ou login, **pare e pergunte** antes de alterar.

## Pontos de atenção na hospedagem
- `NEXTAUTH_URL` precisa ser a URL pública correta. Ela é usada nos links de
  recuperação de senha e nas páginas de retorno do Stripe.
- O webhook do Stripe fica em `/api/stripe/webhook` e precisa
  de um endpoint cadastrado no painel do Stripe apontando para a URL nova.
- O envio diário de notificações é a rota `GET /api/cron/push-daily`, protegida
  por `Authorization: Bearer $CRON_SECRET`. Na Vercel ela é chamada pelo
  `vercel.json`. Em outra hospedagem, agende uma chamada diária a essa rota
  (por volta das 10h UTC / 7h de Brasília).
- Rotas de áudio (`/api/audio?id=...`) funcionam como proxy para arquivos do
  Google Drive.

## Build
`npm run build` gera o client do Prisma, aplica o schema (`prisma db push`),
roda o seed seguro e compila o Next.js.
