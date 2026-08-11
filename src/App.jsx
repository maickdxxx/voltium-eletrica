import { useEffect, useState } from "react";
import { CorujaContentGate, CorujaProvider, buildWhatsAppHref, useCollection, useContent, useTelHref, useWhatsAppUrl } from "./coruja-template/content.jsx";
import { fetchCorujaBlogPost, fetchCorujaBlogPosts } from "./coruja-template/api.js";

function previewBase() {
  if (typeof window === "undefined") return "";
  const raw = String(window.__CORUJA_PREVIEW_BASE_PATH__ || "").trim();
  if (!raw || raw === "/") return "";
  return `/${raw.replace(/^\/+|\/+$/g, "")}`;
}
function siteHref(path = "/") {
  const base = previewBase();
  if (!base) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
function currentRoute() {
  if (typeof window === "undefined") return "/";
  let pathname = window.location.pathname || "/";
  const base = previewBase();
  if (base && pathname.startsWith(base)) pathname = pathname.slice(base.length) || "/";
  return pathname !== "/" ? pathname.replace(/\/+$/, "") : "/";
}
function currentSlug() {
  const match = currentRoute().match(/^\/blog\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : "";
}
function setMeta(name, content, attr = "name") {
  if (!content) return;
  let tag = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}
function setLink(rel, href) {
  if (!href) return;
  let tag = document.head.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement("link");
    tag.rel = rel;
    document.head.appendChild(tag);
  }
  tag.href = href;
}

function SeoManager({ post }) {
  const route = currentRoute();
  const pageId = route === "/servicos"
    ? "services"
    : route === "/projetos"
      ? "projects"
      : route === "/sobre"
        ? "about"
        : route === "/contato"
          ? "contact"
          : route.startsWith("/blog")
            ? "blog"
            : "home";
  const globalTitle = useContent("global.seo.title", "");
  const globalDescription = useContent("global.seo.description", "");
  const globalImage = useContent("global.seo.ogImage", "");
  const pageTitle = useContent(`pages.${pageId}.seo.title`, globalTitle);
  const pageDescription = useContent(`pages.${pageId}.seo.description`, globalDescription);
  const pageImage = useContent(`pages.${pageId}.seo.ogImage`, globalImage);
  const canonicalBase = useContent("global.seo.canonicalBase", "");
  const favicon = useContent("global.brand.faviconUrl", "/favicon.svg");
  const brand = useContent("global.brand.name", "");
  const phone = useContent("global.contact.phoneRaw", "");
  const address = useContent("global.contact.address", "");
  const serviceArea = useContent("global.contact.serviceArea", "");
  useEffect(() => {
    const title = post?.seoTitle || post?.title || pageTitle || globalTitle;
    const description = post?.seoDescription || post?.excerpt || pageDescription || globalDescription;
    document.title = title;
    setMeta("description", description);
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("og:type", post ? "article" : "website", "property");
    const image = post?.coverImage || pageImage;
    if (image) setMeta("og:image", image, "property");
    setLink("icon", favicon);
    const suffix = post ? `/blog/${post.slug}` : route;
    if (canonicalBase) setLink("canonical", `${canonicalBase.replace(/\/+$/, "")}${suffix === "/" ? "" : suffix}`);
    const id = "coruja-electrician-schema";
    document.getElementById(id)?.remove();
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "Electrician", name: brand, telephone: phone, address, areaServed: serviceArea, url: canonicalBase || undefined });
    document.head.appendChild(script);
    return () => script.remove();
  }, [post, pageTitle, pageDescription, pageImage, globalTitle, globalDescription, canonicalBase, favicon, brand, phone, address, serviceArea, route]);
  return null;
}

function Brand() {
  const name = useContent("global.brand.name", "");
  const logo = useContent("global.brand.logoUrl", "");
  return <a className="brand" href={siteHref("/")}>{logo ? <img src={logo} alt={name} /> : <><span className="brand-icon">V</span><span>{name}</span></>}</a>;
}
function Header() {
  const phone = useContent("global.contact.phone", "");
  const tel = useTelHref();
  const wa = useWhatsAppUrl();
  const services = useContent("global.nav.servicesLabel", "");
  const projects = useContent("global.nav.projectsLabel", "");
  const about = useContent("global.nav.aboutLabel", "");
  const blog = useContent("global.nav.blogLabel", "");
  const contact = useContent("global.nav.contactLabel", "");
  const cta = useContent("global.cta.headerLabel", "");
  const links = [["/servicos", services], ["/projetos", projects], ["/sobre", about], ["/blog", blog], ["/contato", contact]];
  return <header className="site-header"><div className="header-line" /><div className="container header-inner"><Brand /><nav className="desktop-nav">{links.map(([href, label]) => <a key={href} href={siteHref(href)}>{label}</a>)}</nav><div className="header-actions"><a className="phone-link" href={tel}>{phone}</a><a className="btn btn-primary btn-small" href={wa} target="_blank" rel="noopener">{cta}</a></div><details className="mobile-menu"><summary aria-label="Abrir menu"><span /><span /><span /></summary><div className="mobile-panel">{links.map(([href, label]) => <a key={href} href={siteHref(href)}>{label}</a>)}<a className="btn btn-primary" href={wa} target="_blank" rel="noopener">{cta}</a></div></details></div></header>;
}
function Footer() {
  const tagline = useContent("global.footer.tagline", "");
  const copyright = useContent("global.footer.copyright", "");
  const email = useContent("global.contact.email", "");
  const phone = useContent("global.contact.phone", "");
  const tel = useTelHref();
  const instagram = useContent("global.social.instagram", "");
  const facebook = useContent("global.social.facebook", "");
  const linkedin = useContent("global.social.linkedin", "");
  const services = useContent("global.nav.servicesLabel", "");
  const projects = useContent("global.nav.projectsLabel", "");
  const about = useContent("global.nav.aboutLabel", "");
  const blog = useContent("global.nav.blogLabel", "");
  const contact = useContent("global.nav.contactLabel", "");
  return <footer className="footer"><div className="footer-slash" /><div className="container footer-grid"><div><Brand /><p>{tagline}</p></div><div className="footer-links"><a href={siteHref("/servicos")}>{services}</a><a href={siteHref("/projetos")}>{projects}</a><a href={siteHref("/sobre")}>{about}</a><a href={siteHref("/blog")}>{blog}</a><a href={siteHref("/contato")}>{contact}</a></div><div className="footer-contact"><a href={tel}>{phone}</a><a href={`mailto:${email}`}>{email}</a><div className="socials">{instagram && <a href={instagram} target="_blank" rel="noopener">Instagram</a>}{facebook && <a href={facebook} target="_blank" rel="noopener">Facebook</a>}{linkedin && <a href={linkedin} target="_blank" rel="noopener">LinkedIn</a>}</div></div></div><div className="container footer-bottom">{copyright}</div></footer>;
}
function FloatingWhatsapp() {
  const wa = useWhatsAppUrl();
  const title = useContent("global.cta.floatingTitle", "");
  const text = useContent("global.cta.floatingText", "");
  const label = useContent("global.cta.floatingButtonLabel", "");
  return <div className="floating-wa"><div><strong>{title}</strong><span>{text}</span></div><a href={wa} target="_blank" rel="noopener" aria-label={label}>↗</a></div>;
}
function Layout({ children, post }) { return <><SeoManager post={post} /><Header /><main>{children}</main><Footer /><FloatingWhatsapp /></>; }
function Eyebrow({ children }) { return <span className="eyebrow"><i /> {children}</span>; }
function SectionTitle({ eyebrow, title, description, light = false }) { return <div className={`section-title ${light ? "light" : ""}`}><Eyebrow>{eyebrow}</Eyebrow><h2>{title}</h2>{description && <p>{description}</p>}</div>; }
function Stats() { const items = useCollection("collections.stats"); return <div className="stats">{items.map(item => <div key={item.id}><strong>{item.value}</strong><span>{item.label}</span></div>)}</div>; }
function ServiceCard({ service, index }) {
  const number = useContent("global.contact.whatsappRaw", "");
  const fallback = useContent("global.contact.whatsappMessage", "");
  const wa = buildWhatsAppHref(number, service.whatsappMessage || fallback);
  return <article className="service-card"><div className="service-head"><span className="service-icon">{service.icon}</span><span className="service-number">0{index + 1}</span></div><span className="tag">{service.highlight}</span><h3>{service.title}</h3><p>{service.description}</p><a href={wa} target="_blank" rel="noopener">{service.ctaLabel}<span>↗</span></a></article>;
}
function ProjectCard({ item, featured = false }) { return <article className={`project-card ${featured ? "featured" : ""}`}><div className="project-image"><img src={item.image} alt={item.imageAlt || item.title} /><span>{item.category}</span></div><div className="project-copy"><h3>{item.title}</h3><p>{item.description}</p></div></article>; }
function PageHero({ page }) {
  const eyebrow = useContent(`pages.${page}.hero.eyebrow`, "");
  const title = useContent(`pages.${page}.hero.title`, "");
  const description = useContent(`pages.${page}.hero.description`, "");
  return <section className="page-hero"><div className="page-hero-grid container"><div><Eyebrow>{eyebrow}</Eyebrow><h1>{title}</h1><p>{description}</p></div><div className="page-hero-mark">↯</div></div></section>;
}
function HomePage() {
  const wa = useWhatsAppUrl();
  const services = useCollection("collections.services");
  const specialties = useCollection("collections.specialties");
  const projects = useCollection("collections.projects");
  const testimonials = useCollection("collections.testimonials");
  const finalMessage = useContent("pages.home.finalCta.whatsappMessage", "");
  const finalWa = useWhatsAppUrl(finalMessage);
  return <Layout><section className="hero"><div className="hero-grid container"><div className="hero-copy"><Eyebrow>{useContent("pages.home.hero.eyebrow", "")}</Eyebrow><h1>{useContent("pages.home.hero.title", "")}</h1><strong className="hero-accent">{useContent("pages.home.hero.titleAccent", "")}</strong><p>{useContent("pages.home.hero.description", "")}</p><div className="hero-actions"><a className="btn btn-primary" href={wa} target="_blank" rel="noopener">{useContent("pages.home.hero.primaryCtaLabel", "")}<span>↗</span></a><a className="btn btn-outline-light" href={siteHref("/servicos")}>{useContent("pages.home.hero.secondaryCtaLabel", "")}</a></div><Stats /></div><div className="hero-visual"><img src={useContent("pages.home.hero.image", "")} alt={useContent("pages.home.hero.imageAlt", "")} /><div className="hero-side-card"><span>{useContent("pages.home.hero.sideLabel", "")}</span><strong>{useContent("pages.home.hero.sideTitle", "")}</strong><p>{useContent("pages.home.hero.sideText", "")}</p></div></div></div><div className="hero-cut" /></section><section className="section"><div className="container"><SectionTitle eyebrow={useContent("pages.home.services.eyebrow", "")} title={useContent("pages.home.services.title", "")} description={useContent("pages.home.services.description", "")} /><div className="services-grid">{services.slice(0, 6).map((service, index) => <ServiceCard key={service.id} service={service} index={index} />)}</div><div className="center-action"><a className="btn btn-dark" href={siteHref("/servicos")}>{useContent("pages.home.services.ctaLabel", "")}</a></div></div></section><section className="section technical"><div className="container"><SectionTitle light eyebrow={useContent("pages.home.specialties.eyebrow", "")} title={useContent("pages.home.specialties.title", "")} description={useContent("pages.home.specialties.description", "")} /><div className="specialty-grid">{specialties.map(item => <article key={item.id}><span>{item.number}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}</div></div></section><section className="section projects-home"><div className="container"><div className="split-title"><SectionTitle eyebrow={useContent("pages.home.projects.eyebrow", "")} title={useContent("pages.home.projects.title", "")} description={useContent("pages.home.projects.description", "")} /><a href={siteHref("/projetos")} className="text-link">{useContent("pages.home.projects.ctaLabel", "")} ↗</a></div><div className="projects-grid">{projects.map((item, index) => <ProjectCard key={item.id} item={item} featured={index === 0} />)}</div></div></section><section className="section testimonials"><div className="container"><SectionTitle eyebrow={useContent("pages.home.testimonials.eyebrow", "")} title={useContent("pages.home.testimonials.title", "")} /><div className="testimonial-grid">{testimonials.map(item => <article key={item.id}><div className="rating">★★★★★ <span>{item.rating}</span></div><blockquote>{item.quote}</blockquote><strong>{item.name}</strong><small>{item.role}</small></article>)}</div></div></section><section className="cta-band"><div className="container cta-grid"><div><Eyebrow>{useContent("pages.home.finalCta.eyebrow", "")}</Eyebrow><h2>{useContent("pages.home.finalCta.title", "")}</h2><p>{useContent("pages.home.finalCta.description", "")}</p></div><a className="btn btn-primary" href={finalWa} target="_blank" rel="noopener">{useContent("pages.home.finalCta.buttonLabel", "")}<span>↗</span></a></div></section></Layout>;
}
function ServicesPage() {
  const services = useCollection("collections.services");
  const process = useCollection("collections.process");
  const faq = useCollection("collections.faq");
  return <Layout><PageHero page="services" /><section className="section"><div className="container"><SectionTitle eyebrow={useContent("pages.services.hero.eyebrow", "")} title={useContent("pages.services.intro.title", "")} description={useContent("pages.services.intro.description", "")} /><div className="services-grid">{services.map((service, index) => <ServiceCard key={service.id} service={service} index={index} />)}</div></div></section><section className="section process-section"><div className="container"><SectionTitle light eyebrow={useContent("pages.services.process.eyebrow", "")} title={useContent("pages.services.process.title", "")} /><div className="process-grid">{process.map(item => <article key={item.id}><span>{item.step}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}</div></div></section><section className="section"><div className="container narrow"><h2 className="faq-title">{useContent("pages.services.faqTitle", "")}</h2><div className="faq-list">{faq.map(item => <details key={item.id}><summary>{item.question}<span>+</span></summary><p>{item.answer}</p></details>)}</div></div></section></Layout>;
}
function ProjectsPage() {
  const projects = useCollection("collections.projects");
  const projectMessage = useContent("pages.projects.whatsappMessage", "");
  const wa = useWhatsAppUrl(projectMessage);
  return <Layout><PageHero page="projects" /><section className="section"><div className="container"><SectionTitle eyebrow={useContent("pages.projects.hero.eyebrow", "")} title={useContent("pages.projects.intro.title", "")} description={useContent("pages.projects.intro.description", "")} /><div className="projects-grid projects-page">{projects.map((item, index) => <ProjectCard key={item.id} item={item} featured={index % 3 === 0} />)}</div></div></section><section className="cta-band"><div className="container cta-grid"><div><h2>{useContent("pages.projects.ctaTitle", "")}</h2><p>{useContent("pages.projects.ctaText", "")}</p></div><a className="btn btn-primary" href={wa} target="_blank" rel="noopener">{useContent("pages.projects.ctaLabel", "")}<span>↗</span></a></div></section></Layout>;
}
function AboutPage() {
  const values = useCollection("collections.values");
  const areas = useCollection("collections.serviceAreas");
  const wa = useWhatsAppUrl();
  return <Layout><PageHero page="about" /><section className="section"><div className="container about-grid"><div><SectionTitle eyebrow={useContent("pages.about.hero.eyebrow", "")} title={useContent("pages.about.story.title", "")} /><p className="lead-copy">{useContent("pages.about.story.paragraph1", "")}</p><p className="lead-copy">{useContent("pages.about.story.paragraph2", "")}</p><a className="btn btn-dark" href={wa} target="_blank" rel="noopener">{useContent("pages.about.ctaLabel", "")}</a></div><div className="values-panel"><h2>{useContent("pages.about.valuesTitle", "")}</h2>{values.map((item, index) => <article key={item.id}><span>0{index + 1}</span><div><h3>{item.title}</h3><p>{item.description}</p></div></article>)}</div></div></section><section className="section areas-section"><div className="container"><h2>{useContent("pages.about.areasTitle", "")}</h2><div className="area-tags">{areas.map(item => <span key={item.id}>{item.text}</span>)}</div></div></section></Layout>;
}
function ContactPage() {
  const formEnabled = Boolean(useContent("pages.contact.form.enabled", true));
  const number = useContent("global.contact.whatsappRaw", "");
  const phone = useContent("global.contact.phone", "");
  const email = useContent("global.contact.email", "");
  const address = useContent("global.contact.address", "");
  const area = useContent("global.contact.serviceArea", "");
  const hours = useContent("global.contact.businessHoursWeek", "");
  const tel = useTelHref();
  const services = useCollection("collections.services");
  const [form, setForm] = useState({ name: "", phone: "", email: "", service: "", message: "" });
  const formTitle = useContent("pages.contact.form.title", "");
  const formDescription = useContent("pages.contact.form.description", "");
  const nameLabel = useContent("pages.contact.form.nameLabel", "");
  const namePlaceholder = useContent("pages.contact.form.namePlaceholder", "");
  const phoneLabel = useContent("pages.contact.form.phoneLabel", "");
  const phonePlaceholder = useContent("pages.contact.form.phonePlaceholder", "");
  const emailLabel = useContent("pages.contact.form.emailLabel", "");
  const emailPlaceholder = useContent("pages.contact.form.emailPlaceholder", "");
  const serviceLabel = useContent("pages.contact.form.serviceLabel", "");
  const servicePlaceholder = useContent("pages.contact.form.servicePlaceholder", "");
  const messageLabel = useContent("pages.contact.form.messageLabel", "");
  const messagePlaceholder = useContent("pages.contact.form.messagePlaceholder", "");
  const submitText = useContent("pages.contact.form.submitText", "");
  const introMessage = useContent("pages.contact.form.whatsappMessage", "");
  const mapTitle = useContent("pages.contact.mapTitle", "");
  const contactEyebrow = useContent("pages.contact.hero.eyebrow", "");
  const infoTitle = useContent("pages.contact.info.title", "");
  const infoDescription = useContent("pages.contact.info.description", "");
  function submit(e) {
    e.preventDefault();
    const body = [introMessage, `Nome: ${form.name}`, `Telefone: ${form.phone}`, form.email ? `E-mail: ${form.email}` : "", form.service ? `Serviço: ${form.service}` : "", `Mensagem: ${form.message}`].filter(Boolean).join("\n");
    window.open(buildWhatsAppHref(number, body), "_blank", "noopener,noreferrer");
  }
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  return <Layout><PageHero page="contact" /><section className="section"><div className="container contact-grid"><aside className="contact-info"><SectionTitle eyebrow={contactEyebrow} title={infoTitle} description={infoDescription} /><div className="contact-items"><a href={tel}><span>TELEFONE</span><strong>{phone}</strong></a><a href={`mailto:${email}`}><span>E-MAIL</span><strong>{email}</strong></a><div><span>REGIÃO</span><strong>{area}</strong></div><div><span>HORÁRIO</span><strong>{hours}</strong></div></div></aside>{formEnabled && <form className="quote-form" onSubmit={submit}><h2>{formTitle}</h2><p>{formDescription}</p><div className="form-row"><label>{nameLabel}<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={namePlaceholder} /></label><label>{phoneLabel}<input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder={phonePlaceholder} /></label></div><label>{emailLabel}<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder={emailPlaceholder} /></label><label>{serviceLabel}<select value={form.service} onChange={e => setForm({ ...form, service: e.target.value })}><option value="">{servicePlaceholder}</option>{services.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}</select></label><label>{messageLabel}<textarea required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder={messagePlaceholder} /></label><button className="btn btn-primary" type="submit">{submitText}<span>↗</span></button></form>}</div></section><section className="map-section"><div className="container"><h2>{mapTitle}</h2><div className="map-shell"><iframe title={mapTitle} src={mapSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div></div></section></Layout>;
}
function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const title = useContent("pages.blog.title", "");
  const eyebrow = useContent("pages.blog.eyebrow", "");
  const description = useContent("pages.blog.description", "");
  const empty = useContent("pages.blog.emptyMessage", "");
  const readMore = useContent("pages.blog.readMoreLabel", "");
  useEffect(() => { let active = true; fetchCorujaBlogPosts().then(data => { if (active) { setPosts(data); setLoading(false); } }); return () => { active = false; }; }, []);
  return <Layout><section className="page-hero"><div className="page-hero-grid container"><div><Eyebrow>{eyebrow}</Eyebrow><h1>{title}</h1><p>{description}</p></div><div className="page-hero-mark">B</div></div></section><section className="section"><div className="container">{loading ? <div className="blog-state">Carregando…</div> : posts.length === 0 ? <div className="blog-state">{empty}</div> : <div className="blog-grid">{posts.map(post => <article key={post.id || post.slug} className="blog-card">{post.coverImage && <img src={post.coverImage} alt={post.coverImageAlt || post.title} />}<div>{post.category && <span className="tag">{post.category}</span>}<h2>{post.title}</h2><p>{post.excerpt}</p><a href={siteHref(`/blog/${encodeURIComponent(post.slug)}`)}>{readMore} ↗</a></div></article>)}</div>}</div></section></Layout>;
}
function BlogPostPage() {
  const slug = currentSlug();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const back = useContent("pages.blog.backLabel", "");
  const empty = useContent("pages.blog.emptyMessage", "");
  useEffect(() => { let active = true; fetchCorujaBlogPost(slug).then(data => { if (active) { setPost(data); setLoading(false); } }); return () => { active = false; }; }, [slug]);
  if (loading) return <Layout><section className="section"><div className="container blog-state">Carregando…</div></section></Layout>;
  if (!post) return <Layout><section className="section"><div className="container blog-state">{empty}</div></section></Layout>;
  return <Layout post={post}><article className="article"><div className="container article-head"><a href={siteHref("/blog")}>← {back}</a>{post.category && <span className="tag">{post.category}</span>}<h1>{post.title}</h1>{post.excerpt && <p>{post.excerpt}</p>}{post.coverImage && <img src={post.coverImage} alt={post.coverImageAlt || post.title} />}</div><div className="container article-body" dangerouslySetInnerHTML={{ __html: post.contentHtml || String(post.content || "") }} /></article></Layout>;
}
function NotFound() { return <Layout><section className="not-found"><div><span>404</span><h1>Página não encontrada</h1><a className="btn btn-dark" href={siteHref("/")}>Voltar ao início</a></div></section></Layout>; }
function RouterView() {
  const route = currentRoute();
  const blogEnabled = Boolean(useContent("blog.enabled", true));
  if (route === "/") return <HomePage />;
  if (route === "/servicos") return <ServicesPage />;
  if (route === "/projetos") return <ProjectsPage />;
  if (route === "/sobre") return <AboutPage />;
  if (route === "/contato") return <ContactPage />;
  if (route === "/blog" && blogEnabled) return <BlogPage />;
  if (/^\/blog\/[^/]+$/.test(route) && blogEnabled) return <BlogPostPage />;
  return <NotFound />;
}
export default function App() { return <CorujaProvider><CorujaContentGate><RouterView /></CorujaContentGate></CorujaProvider>; }
