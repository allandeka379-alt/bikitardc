import { Facebook, Mail, MessageSquare, Phone, Twitter } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { Logo } from '@/components/ui/logo';

const YEAR = new Date().getFullYear();

export function LandingFooter() {
  const t = useTranslations('landing.footer');

  return (
    <footer className="mt-14 border-t border-line bg-white sm:mt-20">
      <div className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8 sm:py-12">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          {/* Brand column */}
          <div className="col-span-2 flex flex-col gap-4">
            <Logo size={36} />
            <p className="max-w-sm text-small text-muted">{t('tagline')}</p>
            <LanguageToggle className="mt-2" />
          </div>

          <Column title={t('services')}>
            <FooterLink href="#services">Rates & Payments</FooterLink>
            <FooterLink href="#services">Business Licence</FooterLink>
            <FooterLink href="#services">Building Plans</FooterLink>
            <FooterLink href="#services">Report an issue</FooterLink>
          </Column>

          <Column title={t('council')}>
            <FooterLink href="/about">{t('links.about')}</FooterLink>
            <FooterLink href="/councillors">{t('links.councillors')}</FooterLink>
            <FooterLink href="/wards">{t('links.wards')}</FooterLink>
            <FooterLink href="/meetings">{t('links.meetings')}</FooterLink>
            <FooterLink href="/tourism">Visit Bikita</FooterLink>
            <FooterLink href="/about#careers">{t('links.careers')}</FooterLink>
          </Column>

          <Column title={t('legal')}>
            <FooterLink href="/legal/privacy">{t('links.privacy')}</FooterLink>
            <FooterLink href="/legal/terms">{t('links.terms')}</FooterLink>
            <FooterLink href="/legal/accessibility">{t('links.accessibility')}</FooterLink>
            <FooterLink href="/legal/data-protection">{t('links.dataProtection')}</FooterLink>
          </Column>
        </div>

        <div className="mt-10 border-t border-line pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-micro text-muted">
              © {YEAR} Bikita Rural District Council. {t('rightsReserved')} · {t('version')}
            </div>
            <div className="flex items-center gap-4 text-muted">
              <FooterIcon href="tel:+263392000000" label={t('links.phone')}>
                <Phone className="h-4 w-4" />
              </FooterIcon>
              <FooterIcon href="#" label={t('links.whatsapp')}>
                <MessageSquare className="h-4 w-4" />
              </FooterIcon>
              <FooterIcon href="mailto:info@bikita.gov.zw" label={t('links.email')}>
                <Mail className="h-4 w-4" />
              </FooterIcon>
              <FooterIcon href="#" label="Twitter">
                <Twitter className="h-4 w-4" />
              </FooterIcon>
              <FooterIcon href="#" label="Facebook">
                <Facebook className="h-4 w-4" />
              </FooterIcon>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-small font-semibold text-ink">{title}</h3>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-sm text-small text-muted transition-colors hover:text-brand-primary"
    >
      {children}
    </Link>
  );
}

function FooterIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition-colors hover:border-brand-primary/30 hover:bg-brand-primary/5 hover:text-brand-primary"
    >
      {children}
    </Link>
  );
}
