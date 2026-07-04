import type { Metadata } from 'next';
import { isValidLocale, getDictionary } from '@/lib/i18n';
import type { Locale } from '@/lib/types';
import { Skull, Mail, Sparkles } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const dict = getDictionary(locale as Locale);
  return { title: `About - ${dict.siteTitle}`, description: dict.siteTagline };
}

const aboutContent: Record<string, { title: string; intro: string; sections: { h: string; p: string }[] }> = {
  en: { title: 'About Us', intro: 'Free online tools for everyone!', sections: [{ h: 'What We Offer', p: 'A classic hangman word guessing game in Spanish. Test your vocabulary!' }, { h: 'Our Mission', p: 'Our goal is to provide useful, free tools that anyone can use without registration or downloads.' }, { h: 'Contact', p: "Have feedback? We'd love to hear from you!" }] },
  es: { title: 'Acerca de Nosotros', intro: '¡Herramientas gratuitas para todos!', sections: [{ h: 'Lo que Ofrecemos', p: 'El clásico juego del ahorcado en español. ¡Pon a prueba tu vocabulario!' }, { h: 'Nuestra Misión', p: 'Proporcionar herramientas útiles y gratuitas que cualquiera pueda usar sin registro.' }, { h: 'Contacto', p: '¿Tienes comentarios? ¡Nos encantaría saber de ti!' }] },
  pt: { title: 'Sobre Nós', intro: 'Ferramentas gratuitas para todos!', sections: [{ h: 'O que Oferecemos', p: 'O clássico jogo da forca em espanhol. Teste seu vocabulário!' }, { h: 'Nossa Missão', p: 'Nosso objetivo é fornecer ferramentas úteis e gratuitas.' }, { h: 'Contato', p: 'Tem feedback? Adoraríamos ouvir você!' }] },
};

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) return null;
  const content = aboutContent[locale] || aboutContent.en;
  return (<div className="mx-auto max-w-3xl px-4 py-8"><div className="mb-8 text-center"><Skull className="mx-auto mb-4 h-12 w-12 text-primary" /><h1 className="mb-2 text-3xl font-bold">{content.title}</h1><p className="text-lg text-muted-foreground">{content.intro}</p></div><div className="space-y-6">{content.sections.map((s,i) => (<section key={i}><h2 className="mb-2 text-xl font-semibold">{s.h}</h2><p className="leading-relaxed text-muted-foreground">{s.p}</p></section>))}</div><div className="mt-6 flex items-center gap-2 rounded-lg border bg-card p-4"><Mail className="h-5 w-5 text-primary" /><a href="mailto:hello@ahorcado.vercel.app" className="text-primary hover:underline">hello@ahorcado.vercel.app</a></div></div>);
}
