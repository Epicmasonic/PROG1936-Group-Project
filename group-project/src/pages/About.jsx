import './About.css'

const About = () => {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-copy">
          <p className="about-eyebrow">About World Bites</p>
          <h1 className="about-title">A global food experience, made easy to explore.</h1>
          <p className="about-description">
            World Bites brings together bold flavours from across the globe with simple browsing, helpful filters, and dishes chosen for every kind of appetite.
          </p>

          <div className="about-actions">
            <a href="/menu" className="about-link primary">Explore the menu</a>
            <a href="/" className="about-link secondary">Back to home</a>
          </div>
        </div>

        <div className="about-highlights">
          <div className="about-highlight-card">
            <h3>🌍 Global flavours</h3>
            <p>Discover dishes inspired by cuisines from around the world in one place.</p>
          </div>
          <div className="about-highlight-card">
            <h3>🔎 Smart filters</h3>
            <p>Find meals by spice, diet, allergens, price, and course in seconds.</p>
          </div>
          <div className="about-highlight-card">
            <h3>🍽️ Made for everyone</h3>
            <p>From vegan picks to comfort food favourites, there is something for every plate.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
