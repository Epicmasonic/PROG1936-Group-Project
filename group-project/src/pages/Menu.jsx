import { useState, useMemo } from 'react'
import data from '../data/db.json'
import './Menu.css'

// ── Helpers ────────────────────────────────────────────────────────────
const FLAGS = {
  India: '🇮🇳', Japan: '🇯🇵', Italy: '🇮🇹', Thailand: '🇹🇭',
  Lebanon: '🇱🇧', Mexico: '🇲🇽', France: '🇫🇷', Spain: '🇪🇸',
  Jamaica: '🇯🇲', Australia: '🇦🇺',
}

const SPICE = {
  'None':      { emoji: '🫙',           color: '#64748b', bg: '#f1f5f9' },
  'Mild':      { emoji: '🌶️',          color: '#16a34a', bg: '#dcfce7' },
  'Medium':    { emoji: '🌶️🌶️',       color: '#d97706', bg: '#fef3c7' },
  'Hot':       { emoji: '🌶️🌶️🌶️',    color: '#dc2626', bg: '#fee2e2' },
  'Extra Hot': { emoji: '🔥🔥🔥',      color: '#991b1b', bg: '#fecaca' },
}

const DIET_COLORS = {
  Vegan:        { color: '#15803d', bg: '#dcfce7' },
  Vegetarian:   { color: '#0369a1', bg: '#e0f2fe' },
  Pescatarian:  { color: '#0891b2', bg: '#cffafe' },
  Omnivore:     { color: '#7c3aed', bg: '#ede9fe' },
}

const COURSE_ICONS = { All: '🍽️', Breakfast: '🍳', Starter: '🥣', Main: '🍛', Dessert: '🍰' }

const MAX_PRICE = 20

const CART_PREVIEW = [
  { id: 1, name: 'Butter Chicken', qty: 1, price: 17.5 },
  { id: 2, name: 'Mango Sticky Rice', qty: 2, price: 9.5 },
  { id: 3, name: 'Veggie Tempura', qty: 1, price: 12.0 },
]

const CartItemRow = ({ item }) => (
  <div className="cart-item-row">
    <div className="cart-item-meta">
      <span className="cart-item-name">{item.name}</span>
      <span className="cart-item-qty">Qty {item.qty}</span>
    </div>
    <span className="cart-item-price">${(item.qty * item.price).toFixed(2)}</span>
  </div>
)

const CartPanel = ({ items, cartOpen, onClose }) => {
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0)
  const tax = subtotal * 0.13
  const total = subtotal + tax

  return (
    <aside className={`cart-panel ${cartOpen ? 'cart-open' : ''}`}>
      <div className="cart-panel-header">
        <div>
          <p className="cart-eyebrow">Your Order</p>
          <h2 className="cart-title">Cart</h2>
        </div>
        <div className="cart-header-actions">
          <span className="cart-count">{items.length} items</span>
          <button className="cart-close-btn" type="button" onClick={onClose}>✕</button>
        </div>
      </div>

      <div className="cart-items-list">
        {items.map(item => (
          <CartItemRow key={item.id} item={item} />
        ))}
      </div>

      <div className="cart-summary-box">
        <div className="summary-row">
          <span>Subtotal</span>
          <strong>${subtotal.toFixed(2)}</strong>
        </div>
        <div className="summary-row">
          <span>Estimated tax</span>
          <strong>${tax.toFixed(2)}</strong>
        </div>
        <div className="summary-row total-row">
          <span>Total</span>
          <strong>${total.toFixed(2)}</strong>
        </div>
      </div>

      <button className="checkout-btn" type="button">Proceed to Checkout</button>
    </aside>
  )
}

// ── DishCard ───────────────────────────────────────────────────────────
const DishCard = ({ dish }) => {
  const spice = SPICE[dish.spiceLevel] || SPICE['None']

  return (
    <div className="dish-card">
      <div className="card-img-wrap">
        <img src={dish.imageUrl} alt={dish.name} className="card-img" loading="lazy" />
        {dish.isGlutenFree && <span className="gf-badge">GF</span>}
        <span className="course-badge">{COURSE_ICONS[dish.course]} {dish.course}</span>
      </div>

      <div className="card-body">
        <div className="card-header-row">
          <h3 className="card-name">{dish.name}</h3>
          <span className="card-price">${dish.price.toFixed(2)}</span>
        </div>

        <p className="card-country">
          {FLAGS[dish.country] || '🌍'} {dish.country}
        </p>

        <p className="card-desc">{dish.description}</p>

        {/* Diet type badges */}
        <div className="badge-row">
          {dish.dietType.map(dt => (
            <span
              key={dt}
              className="badge"
              style={{ color: DIET_COLORS[dt]?.color, background: DIET_COLORS[dt]?.bg }}
            >
              {dt}
            </span>
          ))}
        </div>

        {/* Spice level */}
        <div
          className="spice-pill"
          style={{ color: spice.color, background: spice.bg }}
        >
          {spice.emoji} {dish.spiceLevel}
        </div>

        {/* Allergens */}
        {dish.allergens.length > 0 && (
          <div className="allergen-row">
            <span className="allergen-label">⚠️ Contains:</span>
            {dish.allergens.map(a => (
              <span key={a} className="allergen-tag">{a}</span>
            ))}
          </div>
        )}

        {/* Ingredients preview */}
        <details className="ingredients-details">
          <summary>Ingredients ({dish.ingredients.length})</summary>
          <p className="ingredients-list">
            {dish.ingredients.join(', ')}
          </p>
        </details>

        <button className="add-cart-btn" type="button">Add to cart</button>
      </div>
    </div>
  )
}

// ── FilterSection wrapper ───────────────────────────────────────────────
const FilterSection = ({ title, children }) => (
  <div className="filter-section">
    <h4 className="filter-title">{title}</h4>
    {children}
  </div>
)

// ── Menu Page ──────────────────────────────────────────────────────────
const Menu = () => {
  const { dishes, filters } = data

  // ── Filter State (useState per requirement) ──
  const [search,          setSearch]          = useState('')
  const [activeCourse,    setActiveCourse]    = useState('All')
  const [spiceLevel,      setSpiceLevel]      = useState('')
  const [country,         setCountry]         = useState('')
  const [dietTypes,       setDietTypes]       = useState([])
  const [glutenFree,      setGlutenFree]      = useState(false)
  const [excludeAllergens,setExcludeAllergens]= useState([])
  const [maxPrice,        setMaxPrice]        = useState(MAX_PRICE)
  const [sortBy,          setSortBy]          = useState('default')
  const [sidebarOpen,     setSidebarOpen]     = useState(false)
  const [cartOpen,        setCartOpen]        = useState(false)

  // ── Toggle helpers ──
  const toggleDietType = (dt) =>
    setDietTypes(prev => prev.includes(dt) ? prev.filter(x => x !== dt) : [...prev, dt])

  const toggleAllergen = (a) =>
    setExcludeAllergens(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])

  const clearAllFilters = () => {
    setSearch('')
    setActiveCourse('All')
    setSpiceLevel('')
    setCountry('')
    setDietTypes([])
    setGlutenFree(false)
    setExcludeAllergens([])
    setMaxPrice(MAX_PRICE)
    setSortBy('default')
  }

  const hasActiveFilters =
    search || activeCourse !== 'All' || spiceLevel || country ||
    dietTypes.length > 0 || glutenFree || excludeAllergens.length > 0 ||
    maxPrice < MAX_PRICE || sortBy !== 'default'

  // ── Filtering logic (useMemo for performance) ──
  const filtered = useMemo(() => {
    let result = dishes.filter(dish => {
      // 1. Search: name or ingredient
      if (search) {
        const q = search.toLowerCase()
        const matchName = dish.name.toLowerCase().includes(q)
        const matchIngredient = dish.ingredients.some(i => i.toLowerCase().includes(q))
        if (!matchName && !matchIngredient) return false
      }
      // 2. Course tab
      if (activeCourse !== 'All' && dish.course !== activeCourse) return false
      // 3. Spice level
      if (spiceLevel && dish.spiceLevel !== spiceLevel) return false
      // 4. Country
      if (country && dish.country !== country) return false
      // 5. Diet type (dish must match at least one selected)
      if (dietTypes.length > 0 && !dietTypes.some(dt => dish.dietType.includes(dt))) return false
      // 6. Gluten free toggle
      if (glutenFree && !dish.isGlutenFree) return false
      // 7. Exclude allergens (dish must NOT contain any excluded allergen)
      if (excludeAllergens.length > 0 &&
          excludeAllergens.some(a => dish.allergens.includes(a))) return false
      // 8. Max price
      if (dish.price > maxPrice) return false

      return true
    })

    // Sort
    if (sortBy === 'price-asc')  result = [...result].sort((a, b) => a.price - b.price)
    if (sortBy === 'price-desc') result = [...result].sort((a, b) => b.price - a.price)
    if (sortBy === 'name-asc')   result = [...result].sort((a, b) => a.name.localeCompare(b.name))

    return result
  }, [dishes, search, activeCourse, spiceLevel, country, dietTypes, glutenFree, excludeAllergens, maxPrice, sortBy])

  // ── Render ──
  return (
    <div className="menu-page">

      {/* ── Page Header ── */}
      <div className="menu-header">
        <div className="menu-header-inner">
          <h1 className="menu-title">Our Menu</h1>
          <p className="menu-sub">
            {filtered.length} dish{filtered.length !== 1 ? 'es' : ''} found
            {hasActiveFilters && ' · Filters active'}
          </p>
        </div>

        {/* Sort + mobile filter toggle */}
        <div className="menu-toolbar">
          <select
            className="sort-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="name-asc">Name: A → Z</option>
          </select>

          <button className="filter-toggle-btn" onClick={() => setSidebarOpen(o => !o)}>
            {sidebarOpen ? '✕ Close' : '⚙️ Filters'}
          </button>

          <button className="cart-toggle-btn" onClick={() => setCartOpen(o => !o)}>
            🛒 Cart
          </button>
        </div>
      </div>

      {/* ── Course Tabs ── */}
      <div className="course-tabs">
        {['All', ...filters.courses].map(c => (
          <button
            key={c}
            className={`course-tab ${activeCourse === c ? 'active' : ''}`}
            onClick={() => setActiveCourse(c)}
          >
            {COURSE_ICONS[c]} {c}
          </button>
        ))}
      </div>

      {/* ── Main layout: Sidebar + Grid ── */}
      <div className="menu-layout">

        {/* ── Sidebar ── */}
        <aside className={`filter-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="sidebar-top">
            <span className="sidebar-heading">Filters</span>
            {hasActiveFilters && (
              <button className="clear-btn" onClick={clearAllFilters}>Clear all</button>
            )}
          </div>

          {/* Search */}
          <FilterSection title="🔍 Search by name or ingredient">
            <input
              className="filter-input"
              type="text"
              placeholder="e.g. chicken, garlic, avocado…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </FilterSection>

          {/* Price range */}
          <FilterSection title={`💰 Max Price: $${maxPrice.toFixed(2)}`}>
            <input
              className="price-slider"
              type="range"
              min={5}
              max={MAX_PRICE}
              step={0.5}
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
            />
            <div className="price-range-labels">
              <span>$5.00</span>
              <span>${MAX_PRICE}.00</span>
            </div>
          </FilterSection>

          {/* Country */}
          <FilterSection title="🌍 Country">
            <select
              className="filter-input"
              value={country}
              onChange={e => setCountry(e.target.value)}
            >
              <option value="">All Countries</option>
              {filters.countries.map(c => (
                <option key={c} value={c}>{FLAGS[c]} {c}</option>
              ))}
            </select>
          </FilterSection>

          {/* Spice Level */}
          <FilterSection title="🌶️ Spice Level">
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="spice"
                  value=""
                  checked={spiceLevel === ''}
                  onChange={() => setSpiceLevel('')}
                />
                Any
              </label>
              {filters.spiceLevels.map(s => (
                <label key={s} className="radio-label">
                  <input
                    type="radio"
                    name="spice"
                    value={s}
                    checked={spiceLevel === s}
                    onChange={() => setSpiceLevel(s)}
                  />
                  {SPICE[s]?.emoji} {s}
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Diet Type */}
          <FilterSection title="🥗 Diet Type">
            <div className="check-group">
              {filters.dietTypes.map(dt => (
                <label key={dt} className="check-label">
                  <input
                    type="checkbox"
                    checked={dietTypes.includes(dt)}
                    onChange={() => toggleDietType(dt)}
                  />
                  {dt}
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Gluten Free */}
          <FilterSection title="🌾 Gluten Free">
            <label className="toggle-label">
              <div className={`toggle-switch ${glutenFree ? 'on' : ''}`} onClick={() => setGlutenFree(g => !g)}>
                <div className="toggle-knob" />
              </div>
              <span>{glutenFree ? 'Gluten-Free only' : 'Show all'}</span>
            </label>
          </FilterSection>

          {/* Exclude Allergens */}
          <FilterSection title="⚠️ Exclude Allergens">
            <div className="check-group">
              {filters.allergens.map(a => (
                <label key={a} className="check-label allergen-check">
                  <input
                    type="checkbox"
                    checked={excludeAllergens.includes(a)}
                    onChange={() => toggleAllergen(a)}
                  />
                  {a}
                </label>
              ))}
            </div>
          </FilterSection>
        </aside>

        {/* ── Dish Grid ── */}
        <div className="dish-grid-wrap">
          {filtered.length === 0 ? (
            <div className="no-results">
              <span className="no-results-icon">🍽️</span>
              <h3>No dishes match your filters</h3>
              <p>Try adjusting or clearing your filters.</p>
              <button className="btn-clear-large" onClick={clearAllFilters}>Clear all filters</button>
            </div>
          ) : (
            <div className="dish-grid">
              {filtered.map(dish => (
                <DishCard key={dish.id} dish={dish} />
              ))}
            </div>
          )}
        </div>

        <CartPanel items={CART_PREVIEW} cartOpen={cartOpen} onClose={() => setCartOpen(false)} />

      </div>
    </div>
  )
}

export default Menu
