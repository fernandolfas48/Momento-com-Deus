export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    // Sempre retorna sucesso pra não vazar se email existe
    if (!user) return NextResponse.json({ success: true });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

    await prisma.user.update({
      where: { email },
      data: { passwordResetToken: token, passwordResetExpires: expires },
    });

    const appUrl = process.env.NEXTAUTH_URL ?? 'https://momento-com-deus.vercel.app';
    const resetUrl = `${appUrl}/redefinir-senha?token=${token}`;

    await resend.emails.send({
      from: 'Momento com Deus <noreply@momentocomdeus.app>',
      to: email,
      subject: 'Redefinição de senha — Momento com Deus',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #C9A84C, #E8C96B); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; font-size: 28px;">☀️</div>
            <h1 style="color: #1a1a1a; font-size: 22px; margin-top: 16px;">Momento com Deus</h1>
          </div>
          <h2 style="color: #1a1a1a; font-size: 18px; margin-bottom: 8px;">Redefinição de senha</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 24px;">
            Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha. O link expira em <strong>1 hora</strong>.
          </p>
          <a href="${resetUrl}" style="display: block; text-align: center; background: linear-gradient(135deg, #C9A84C, #E8C96B); color: white; text-decoration: none; padding: 14px 24px; border-radius: 12px; font-weight: 600; font-size: 15px; margin-bottom: 24px;">
            Redefinir minha senha
          </a>
          <p style="color: #999; font-size: 13px; line-height: 1.6;">
            Se você não solicitou a redefinição de senha, ignore este email. Sua senha permanecerá a mesma.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
          <p style="color: #ccc; font-size: 12px; text-align: center;">Momento com Deus • Sua jornada espiritual diária</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
