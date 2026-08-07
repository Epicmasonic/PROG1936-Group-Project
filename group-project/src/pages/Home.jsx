import { useState, useEffect } from 'react'
import './Home.css'

// Floating food emojis in the hero background
const FLOATERS = [
  { emoji: '🍜', style: { top: '10%',  left: '5%',  animationDelay: '0s',   animationDuration: '6s'  } },
  { emoji: '🌮', style: { top: '20%',  left: '88%', animationDelay: '1s',   animationDuration: '7s'  } },
  { emoji: '🍣', style: { top: '55%',  left: '92%', animationDelay: '2s',   animationDuration: '5.5s'} },
  { emoji: '🍕', style: { top: '75%',  left: '8%',  animationDelay: '0.5s', animationDuration: '8s'  } },
  { emoji: '🥘', style: { top: '40%',  left: '3%',  animationDelay: '3s',   animationDuration: '6.5s'} },
  { emoji: '🧆', style: { top: '85%',  left: '80%', animationDelay: '1.5s', animationDuration: '7.5s'} },
  { emoji: '🍛', style: { top: '15%',  left: '50%', animationDelay: '2.5s', animationDuration: '6s'  } },
  { emoji: '🥗', style: { top: '65%',  left: '60%', animationDelay: '4s',   animationDuration: '5s'  } },
  { emoji: '🍷', style: { top: '30%',  left: '25%', animationDelay: '0.8s', animationDuration: '9s'  } },
  { emoji: '🧁', style: { top: '90%',  left: '40%', animationDelay: '3.5s', animationDuration: '6.8s'} },
]

// Cycling taglines in the hero
const TAGLINES = [
  'A world of flavours, one menu.',
  'Filter by spice. Discover by passion.',
  'From Tokyo to Tuscany — taste it all.',
  'Your dietary needs, perfectly matched.',
  'Bold dishes. Honest ingredients.',
]

const STATS = [
  { value: 10,   suffix: '+', label: 'Dishes'     },
  { value: 10,   suffix: '',  label: 'Cuisines'   },
  { value: 5,    suffix: '',  label: 'Diet Types'  },
  { value: 100,  suffix: '%', label: 'Flavour'    },
]

const STAT_ROUNDING = 10
function roundDownTo(number, roundTarget) {
  return Math.floor(number / roundTarget) * roundTarget
}

STATS[0].value = roundDownTo(data.dishes.length, STAT_ROUNDING)

const countries = new Set()
const dietTypes = new Set()

for (const dish of data.dishes) {
  if (dish.country) {
    countries.add(dish.country)
  }

  for (const type of dish.dietType || []) {
    dietTypes.add(type)
  }
}

STATS[1].value = countries.size
STATS[2].value = dietTypes.size

// Animated counter hook
const useCounter = (target, duration = 1500) => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = Math.ceil(target / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return count
}

const StatCard = ({ value, suffix, label }) => {
  const count = useCounter(value)
  return (
    <div className="stat-card">
      <span className="stat-number">{count}{suffix}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

const Home = () => {
  const [taglineIndex, setTaglineIndex] = useState(0)
  const [fade, setFade]     = useState(true)
  const [scrolled, setScrolled] = useState(false)

  // Cycle taglines every 3 seconds with fade transition
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setTaglineIndex(i => (i + 1) % TAGLINES.length)
        setFade(true)
      }, 400)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Detect scroll to trigger feature cards animation
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="home">

      {/* ── Hero ── */}
      <section className="hero">

        {/* Floating food emojis */}
        {FLOATERS.map((f, i) => (
          <span key={i} className="floater" style={f.style}>{f.emoji}</span>
        ))}

        {/* Animated orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div className="hero-content">
          <div className="hero-badge">🌍 World Cuisine Awaits</div>
          <h1 className="hero-title">
            <span className="title-line-1">World</span>
            <span className="title-line-2">Bites</span>
          </h1>

          {/* Cycling tagline */}
          <p className={`hero-tagline ${fade ? 'tagline-visible' : 'tagline-hidden'}`}>
            {TAGLINES[taglineIndex]}
          </p>

          <div className="hero-actions">
            <a href="/menu" className="btn-primary">Explore Menu 🍽️</a>
            <a href="#features" className="btn-secondary">How it works</a>
          </div>

          {/* Scroll indicator */}
          <div className="scroll-indicator">
            <div className="scroll-dot" />
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="stats-bar">
        {STATS.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </section>

      {/* ── Cuisine Marquee ── */}
      <div className="marquee-wrapper" aria-hidden="true">
        <div className="marquee-track">
          {[...Array(3)].map((_, gi) => (
            <span key={gi} className="marquee-group">
              🇮🇳 Indian &nbsp;·&nbsp; 🇯🇵 Japanese &nbsp;·&nbsp; 🇮🇹 Italian &nbsp;·&nbsp;
              🇹🇭 Thai &nbsp;·&nbsp; 🇱🇧 Lebanese &nbsp;·&nbsp; 🇲🇽 Mexican &nbsp;·&nbsp;
              🇫🇷 French &nbsp;·&nbsp; 🇪🇸 Spanish &nbsp;·&nbsp; 🇯🇲 Jamaican &nbsp;·&nbsp;
              🇦🇺 Australian &nbsp;·&nbsp; 🇬🇷 Greek &nbsp;·&nbsp; 🇲🇦 Moroccan &nbsp;·&nbsp;
              🇰🇷 Korean &nbsp;·&nbsp; 🇻🇳 Vietnamese &nbsp;·&nbsp; 🇵🇪 Peruvian &nbsp;·&nbsp;
              🇳🇬 Nigerian &nbsp;·&nbsp; 🇹🇷 Turkish &nbsp;·&nbsp; 🇧🇷 Brazilian &nbsp;·&nbsp;
              🇩🇪 German &nbsp;·&nbsp; 🇨🇳 Chinese &nbsp;·&nbsp; 🇪🇹 Ethiopian &nbsp;·&nbsp;
              🇦🇷 Argentine &nbsp;·&nbsp; 🇺🇸 American &nbsp;·&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section className="features" id="features">
        <h2 className="section-title">Why World Bites?</h2>
        <p className="section-sub">Everything you need to find your perfect dish.</p>

        <div className={`features-grid ${scrolled ? 'features-visible' : ''}`}>
          {[
            { icon: '🌍', title: 'Global Cuisines',   desc: 'Dishes from' + roundDownTo(STATS[1].value, STAT_ROUNDING) + '+ countries — India, Japan, Italy, Thailand, Jamaica and more.' },
            { icon: '🔍', title: 'Smart Filtering',   desc: 'Filter by spice, allergens, diet type, ingredients, country, and price.' },
            { icon: '🥗', title: 'Diet Friendly',     desc: 'Vegan, Vegetarian, Pescatarian, and Gluten-Free options clearly labelled.' },
            { icon: '💰', title: 'Great Value',       desc: 'Fair prices across every course — from starters all the way to desserts.' },
          ].map((card, i) => (
            <div
              key={i}
              className="feature-card"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <div className="card-icon-wrap">
                <span className="card-icon">{card.icon}</span>
              </div>
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="cta-banner">
        <div className="cta-content">
          <h2>Ready to find your next favourite dish?</h2>
          <p>Browse our full menu and use our powerful filters to match exactly what you're craving.</p>
          <a href="/menu" className="btn-primary btn-large">Go to Menu →</a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="home-footer">
        <p>© 2025 World Bites Restaurant App &mdash; PROG1936 Group Project</p>
      </footer>

    </div>
  )
}

export default Home
