import './App.css'

 const intentionallyBroken = "This will fail the linter!";

const highlights = [
  { label: 'Projects launched', value: '48' },
  { label: 'Average sprint length', value: '14 days' },
  { label: 'Client retention', value: '96%' },
]

const features = [
  {
    title: 'Clarity before code',
    text: 'Turn rough product ideas into a tight scope, visual direction, and delivery plan in a single workshop.',
  },
  {
    title: 'Fast design systems',
    text: 'Build a branded UI foundation that scales from landing page to dashboard without drifting off-course.',
  },
  {
    title: 'Measured handoff',
    text: 'Ship with analytics, copy structure, and component rules so the site can keep improving after launch.',
  },
]

function App() {
  return (
    <main className="page">
      <section className="hero-section">
        <p className="eyebrow">DevOps13 Studio</p>
        <div className="hero-copy">
          <div>
            <h1>One focused class ready for launch.</h1>
            <p className="lead">
              We design and ship polished marketing pages for small teams that
              need a clear message, fast momentum, and a site that feels
              deliberate from the first scroll.
            </p>
          </div>
          <div className="hero-panel">
            <p className="panel-label">This week’s availability</p>
            <p className="panel-value">3 kickoff slots left</p>
            <p className="panel-text">
              Strategy, copy framing, and launch-ready UI in one compact sprint.
            </p>
            <div className="cta-row">
              <a className="button button-primary" href="#contact">
                Book a strategy call
              </a>
              <a className="button button-secondary" href="#services">
                View services
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section" aria-label="Business highlights">
        {highlights.map((item) => (
          <article className="stat-card" key={item.label}>
            <p className="stat-value">{item.value}</p>
            <p className="stat-label">{item.label}</p>
          </article>
        ))}
      </section>

      <section className="content-grid" id="services">
        <div>
          <p className="section-tag">What you get</p>
          <h2>A small site with real structure behind it.</h2>
          <p className="section-copy">
            The page is simple on purpose: crisp hierarchy, a strong call to
            action, and enough proof to help visitors decide quickly.
          </p>
        </div>
        <div className="feature-list">
          {features.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="quote-section">
        <p className="quote-mark">“</p>
        <blockquote>
          DevOps13 took our rough notes and turned them into a page we could
          actually launch with confidence.
        </blockquote>
        <p className="quote-attribution">Maya Chen, founder at Fieldnote</p>
      </section>

      <section className="contact-section" id="contact">
        <div>
          <p className="section-tag">Ready to move</p>
          <h2>Start with a short planning call.</h2>
        </div>
        <a className="button button-primary" href="mailto:hello@devops13.test">
          hello@devops13.test
        </a>
      </section>
    </main>
  )
}

export default App
