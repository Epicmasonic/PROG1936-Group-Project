# README

## World Bites — React + Firebase Restaurant Ordering App

A single-page restaurant ordering application built with React and Firebase
Firestore. Customers browse a filterable global menu, build a cart, place an
order, and can then look up, edit, or cancel that order.

---

## Team

- Mohammad Farzin Ghahremani
- Mohammed Ayaan
- Maison Harrison

---

## Running the project

```bash
cd group-project
npm install
```

Create a `.env` file in the `group-project` folder (same level as
`package.json`). Copy the keys from `.env.example` and fill in the values from
the Firebase console under **Project Settings → Your apps**:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

`.env` is git-ignored, so every developer creates their own copy locally.
Vite only exposes variables prefixed with `VITE_`, and it only reads them at
startup — restart the dev server after changing them.

```bash
npm run dev
```

---

## Application workflow

```
Home  ──►  Menu  ──►  Cart panel  ──►  Checkout  ──►  Orders
 (/)      (/menu)     (in Menu)      (/checkout)    (/orders)
                                          │              │
                                     writes order    edit / cancel
                                     to Firestore    existing order
```

1. **Home** (`/`) — landing page with the restaurant's branding. No data layer.
2. **Menu** (`/menu`) — fetches all dishes from the Firestore `menuItems`
   collection on mount, then filters them client-side (search, course, spice
   level, country, diet type, gluten-free, allergen exclusion, price, sort).
   Each dish has an **Add to Cart** button.
3. **Cart** — a slide-out panel inside the Menu page. Cart contents live in
   React state via `CartContext`, **not** in Firestore, because a cart is
   temporary until it is actually submitted. Subtotal, tax (13%), and total
   are derived from the cart array.
4. **Checkout** (`/checkout`) — a form for customer name and optional notes.
   Submitting **creates** a new document in the Firestore `orders` collection
   and shows the generated Order ID.
5. **Orders** (`/orders`) — reads every document from `orders` and renders one
   card per order, each with **Edit** and **Cancel order** buttons.
   - *Edit* loads that order's items back into the cart and returns the user to
     the Menu, so they can adjust quantities. Submitting from Checkout then
     **updates** the existing document instead of creating a new one.
   - *Cancel order* **deletes** the document.

---

## Firestore data model

Two collections, each with a distinct purpose.

### `menuItems`

Reference data — read by the app, never written to by it. Seeded once from
`src/data/db.json`.

```
menuItems/{autoId}
  name          "Butter Chicken"
  description   "Tender chicken pieces simmered in..."
  country       "India"
  course        "Main"          // Breakfast | Starter | Main | Dessert
  price         16.99
  spiceLevel    "Medium"        // None | Mild | Medium | Hot | Extra Hot
  dietType      ["Omnivore"]
  isGlutenFree  true
  allergens     ["Dairy", "Tree Nuts"]
  ingredients   ["chicken", "tomato", ...]
  imageUrl      "https://..."
```

### `orders`

Transactional data — created, updated, and deleted by the app at runtime.
The collection is created automatically by the first `addDoc` call.

```
orders/{autoId}          // autoId is the Order ID shown to the customer
  customerName  "Farzin"
  notes         "no onions"
  items         [ { id, name, price, qty }, ... ]
  subtotal      34.96
  tax           4.55
  total         39.51
  status        "pending"
  createdAt     <serverTimestamp>
```

**Why two collections?** The menu is stable reference data that is read
constantly and rarely changes; orders are written on every checkout and are
independently editable and deletable. Keeping them separate means each order
document can be targeted by its own ID without touching menu data.

**Note on `db.json`:** the file is still imported by `Menu.jsx`, but only for
the static `filters` object (the lists of countries, spice levels, diet types,
and allergens used to build the filter sidebar). The actual dish records come
from Firestore. These filter option lists are fixed UI configuration, not user
data, so there is no benefit to querying them from the database.

---

## CRUD implementation

| Operation | Firestore call | File | Triggered by |
|---|---|---|---|
| **Create** | `addDoc(collection(db, 'orders'), {...})` | `pages/Checkout.jsx` | Placing an order |
| **Read** | `getDocs(collection(db, 'menuItems'))` | `pages/Menu.jsx` | Menu page mount |
| **Read** | `getDocs(collection(db, 'orders'))` | `pages/Orders.jsx` | Orders page mount |
| **Update** | `updateDoc(doc(db, 'orders', id), {...})` | `pages/Checkout.jsx` | Saving an edited order |
| **Delete** | `deleteDoc(doc(db, 'orders', id))` | `pages/Orders.jsx` | Cancelling an order |

---

## Project structure

```
group-project/
├── .env                  (git-ignored — create locally, see above)
├── .env.example          template listing the required variable names
├── src/
│   ├── firebase.jsx      initialises Firebase, exports `db` and `auth`
│   ├── main.jsx          entry point — mounts App into #root
│   ├── App.jsx           BrowserRouter + CartProvider + route table
│   │
│   ├── components/
│   │   └── Navbar.jsx    NavLink navigation, active states, mobile menu
│   │
│   ├── context/
│   │   ├── cart-context.js    createContext definition
│   │   ├── CartContext.jsx    CartProvider — cart state + totals + edit mode
│   │   └── useCart.js         useCart() convenience hook
│   │
│   ├── pages/
│   │   ├── Home.jsx      landing page
│   │   ├── About.jsx     restaurant info
│   │   ├── Menu.jsx      Firestore read + filtering + cart panel
│   │   ├── Checkout.jsx  order form — CREATE and UPDATE
│   │   └── Orders.jsx    order list — READ and DELETE
│   │
│   └── data/db.json      filter option lists (and original seed data)
```

---

## React concepts used

- **Functional components throughout** — no class components anywhere.
- **`useState`** — cart contents and edit mode in `CartContext`; every filter
  field in `Menu.jsx`; form fields, loading, and error states in `Checkout.jsx`;
  fetched orders and loading state in `Orders.jsx`.
- **`useEffect`** — triggers the Firestore fetch once on mount in both
  `Menu.jsx` and `Orders.jsx` (empty dependency array).
- **`useMemo`** — memoises the filtered/sorted dish list in `Menu.jsx` so the
  filter chain only re-runs when a filter or the dish list actually changes.
- **Props** — `Menu.jsx` passes dishes and handlers down to `DishCard`,
  `CartPanel`, and `FilterSection`; `Orders.jsx` passes each order plus
  `onEdit`/`onCancel` callbacks down to `OrderCard`.
- **Context** — `CartContext` shares cart state across routes so the Menu page
  and the Checkout page work from the same cart without prop-drilling through
  the router.
- **React Router** — `BrowserRouter`, `Routes`/`Route`, `NavLink` in the navbar,
  and `useNavigate` for redirecting after an edit or checkout.
- **Rendering lists** — `.map()` with stable `key` props (document IDs, never
  array indexes).
- **Form validation** — the checkout form requires a customer name, trims
  whitespace before saving, blocks submission on an empty cart, disables the
  submit button while the write is in flight, and surfaces a message if the
  Firestore write fails.

---

## Known limitations / out of scope

- **No authentication.** All orders live in one shared collection with no
  `userId` field, so the Orders page shows every order rather than only the
  current customer's. In production each order would carry the signed-in user's
  ID and the list would be filtered with a `where()` query.
- **No payment processing.** Checkout records the order; it does not charge
  anything.
- **`status` is not advanced by the app.** Orders are created as `pending`.
  In a real system a staff-side dashboard would move an order through
  preparing/completed; there is no staff interface in this build.
- **Menu items are not editable in-app** by design — customers should not be
  able to change the restaurant's menu. Menu data is seeded directly into
  Firestore.
