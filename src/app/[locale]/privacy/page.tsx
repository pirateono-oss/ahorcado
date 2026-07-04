import type { Metadata } from 'next';
import { isValidLocale, getDictionary } from '@/lib/i18n';
import type { Locale } from '@/lib/types';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params; if (!isValidLocale(locale)) return {};
  const dict = getDictionary(locale as Locale);
  return { title: `Privacy - ${dict.siteTitle}`, description: 'Privacy policy' };
}

const data: Record<string,{title:string;sections:{h:string;p:string}[]}> = {
  en: { title: 'Privacy Policy', sections: [{ h: 'Data Collection', p: 'We do not collect personal data. Google AdSense may use cookies.' }, { h: 'Cookies', p: 'We use cookies only for AdSense. You can opt out via Google Ads Settings.' }, { h: 'Third Parties', p: 'We display ads via Google AdSense.' }, { h: 'Contact', p: 'Questions? Contact us via the About page.' }] },
  es: { title: 'Política de Privacidad', sections: [{ h: 'Recopilación de Datos', p: 'No recopilamos datos personales. Google AdSense puede usar cookies.' }, { h: 'Cookies', p: 'Usamos cookies solo para AdSense.' }, { h: 'Terceros', p: 'Mostramos anuncios mediante Google AdSense.' }, { h: 'Contacto', p: '¿Preguntas? Contáctanos desde la página Acerca de.' }] },
  pt: { title: 'Política de Privacidade', sections: [{ h: 'Coleta de Dados', p: 'Não coletamos dados pessoais. O Google AdSense pode usar cookies.' }, { h: 'Cookies', p: 'Usamos cookies apenas para o AdSense.' }, { h: 'Terceiros', p: 'Exibimos anúncios através do Google AdSense.' }, { h: 'Contato', p: 'Dúvidas? Entre em contato pela página Sobre.' }] },
};

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; if (!isValidLocale(locale)) return null;
  const c = data[locale] || data.en;
  return (<div className="mx-auto max-w-3xl px-4 py-8"><h1 className="mb-8 text-3xl font-bold">{c.title}</h1><div className="space-y-6">{c.sections.map((s,i) => (<section key={i}><h2 className="mb-2 text-xl font-semibold">{s.h}</h2><p className="leading-relaxed text-muted-foreground">{s.p}</p></section>))}</div></div>);
}
