import 'nextra-theme-docs/style.css';
import '../styles.css';

export const dynamic = 'force-static';
export const revalidate = false;

import { Banner, Head } from 'nextra/components';
import { getPageMap } from 'nextra/page-map';
import { Footer, Layout, Navbar } from 'nextra-theme-docs';
import { EB_Garamond } from 'next/font/google';

import brandTheme, { logo } from '../theme.config';

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-eb-garamond',
  display: 'swap'
});

const navbar = (
  <Navbar
    logo={logo}
    projectLink={brandTheme.projectLink}
    chatLink={brandTheme.chatLink}
  />
);

const footer = <Footer>{brandTheme.footerText}</Footer>;

export const metadata = {
  title: 'x402 Product Docs',
  description: 'x402 product documentation site.'
};

export default async function RootLayout({ children }) {
  const pageMap = await getPageMap();

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning className={ebGaramond.variable}>
      <Head>
        <meta name="theme-color" content="#bd482d" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      <body>
        <Layout
          banner={
          <Banner storageKey="rg-docs-banner">
            Need help or updates? Join{' '}
            <a href={brandTheme.chatLink} target="_blank" rel="noreferrer">
              the RaidGuild Discord
            </a>
            .
          </Banner>
          }
          navbar={navbar}
          footer={footer}
          pageMap={pageMap}
          docsRepositoryBase={brandTheme.docsRepositoryBase}
          feedback={{ content: null }}
          sidebar={{ toggleButton: true, defaultMenuCollapseLevel: 6, defaultOpen: true, autoCollapse: false }}
          toc={{ float: true }}
          darkMode
          nextThemes={{ attribute: 'class', defaultTheme: 'system', storageKey: 'rg-theme' }}
          themeSwitch={{ dark: 'Dark', light: 'Light', system: 'System' }}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
