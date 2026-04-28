const PHONE = "917491081509";
const defaultMessage = "Hi Roll Box! I want to place an order.";
const locationMessage = "Hi Roll Box! Please share directions to your Gaur Yamuna City outlet.";

const menuItems = [
  {id:1,name:"Classic Veg Roll",type:"veg",tag:"veg",price:50,desc:"Simple, saucy and pocket friendly."},
  {id:2,name:"Aloo Masala Roll",type:"veg",tag:"veg",price:60,desc:"Spiced potato filling with crunchy salad."},
  {id:3,name:"Paneer Roll",type:"veg",tag:"veg",price:90,desc:"Soft paneer, onions and house chutney."},
  {id:4,name:"Paneer Cheese Roll",type:"veg",tag:"veg",price:110,desc:"Creamy paneer with melted cheese."},
  {id:5,name:"Soya Chaap Roll",type:"veg",tag:"veg",price:100,desc:"Smoky chaap with bold spices."},
  {id:6,name:"Egg Roll",type:"nonveg",tag:"nonveg",price:70,desc:"Egg layered paratha with fresh salad."},
  {id:7,name:"Chicken Roll",type:"nonveg",tag:"nonveg",price:110,desc:"Juicy chicken filling with Roll Box sauces."},
  {id:8,name:"Chicken Cheese Roll",type:"nonveg",tag:"nonveg",price:130,desc:"Chicken roll upgraded with melted cheese."},
  {id:9,name:"Veg Burger",type:"snacks",tag:"veg",price:60,desc:"Crispy patty, lettuce and mayo."},
  {id:10,name:"Chicken Burger",type:"snacks",tag:"nonveg",price:90,desc:"Chicken patty with cafe-style sauces."},
  {id:11,name:"Peri Peri Fries",type:"snacks",tag:"veg",price:80,desc:"Crispy fries tossed in peri peri seasoning."},
  {id:12,name:"Cheese Fries",type:"snacks",tag:"veg",price:100,desc:"Fries loaded with creamy cheese."},
  {id:13,name:"White Sauce Pasta",type:"meals",tag:"veg",price:140,desc:"Creamy pasta for a filling cafe meal."},
  {id:14,name:"Red Sauce Pasta",type:"meals",tag:"veg",price:130,desc:"Tangy tomato pasta with herbs."},
  {id:15,name:"Veg Sandwich",type:"snacks",tag:"veg",price:70,desc:"Grilled sandwich with fresh veggies."},
  {id:16,name:"Chicken Sandwich",type:"snacks",tag:"nonveg",price:100,desc:"Toasted sandwich with chicken filling."},
  {id:17,name:"Veg Momos",type:"snacks",tag:"veg",price:80,desc:"Steamed momos served with spicy chutney."},
  {id:18,name:"Cold Coffee Shake",type:"meals",tag:"veg",price:90,desc:"Chilled shake for a quick cafe refresh."}
];

let activeFilter = "all";
let orderMode = "Pickup";
let cart = [];

const waLink = message => `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
const qs = selector => document.querySelector(selector);
const qsa = selector => [...document.querySelectorAll(selector)];

function setStaticLinks(){
  qsa(".js-wa").forEach(link => link.href = waLink(defaultMessage));
  qsa(".js-wa-order").forEach(link => link.href = waLink("Hi Roll Box! I want to order from the menu."));
  qsa(".js-wa-location").forEach(link => link.href = waLink(locationMessage));
}

function renderMenu(){
  const search = qs("#menuSearch").value.trim().toLowerCase();
  const grid = qs("#menuGrid");
  const filtered = menuItems.filter(item => {
    const matchesFilter = activeFilter === "all" || item.type === activeFilter;
    const matchesSearch = !search || `${item.name} ${item.desc}`.toLowerCase().includes(search);
    return matchesFilter && matchesSearch;
  });

  grid.innerHTML = filtered.map(item => `
    <article class="menu-item">
      <div class="menu-top">
        <div>
          <div class="menu-name">${item.name}</div>
          <p class="menu-desc">${item.desc}</p>
        </div>
        <span class="${item.tag === "veg" ? "veg-dot" : "nonveg-dot"}" title="${item.tag === "veg" ? "Veg" : "Non-veg"}"></span>
      </div>
      <div class="menu-bottom">
        <div class="price">Rs. ${item.price}</div>
        <button class="add-btn" type="button" data-id="${item.id}">Add</button>
      </div>
    </article>
  `).join("");

  qs("#emptyMenu").style.display = filtered.length ? "none" : "block";
  grid.querySelectorAll(".add-btn[data-id]").forEach(btn => {
    btn.addEventListener("click", () => addToCart(Number(btn.dataset.id)));
  });
}

function addToCart(id){
  const found = cart.find(line => line.id === id);
  if(found) found.qty += 1;
  else cart.push({...menuItems.find(item => item.id === id), qty:1});
  qs("#orderPanel").classList.add("open");
  renderCart();
}

function changeQty(id, delta){
  const found = cart.find(line => line.id === id);
  if(!found) return;
  found.qty += delta;
  cart = cart.filter(line => line.qty > 0);
  renderCart();
}

function renderCart(){
  const holder = qs("#cartItems");
  const count = cart.reduce((sum,line) => sum + line.qty, 0);
  const total = cart.reduce((sum,line) => sum + line.price * line.qty, 0);

  qs("#cartCount").textContent = count;
  qs("#cartTotal").textContent = `Rs. ${total}`;
  holder.className = cart.length ? "" : "cart-empty";
  holder.innerHTML = cart.length ? cart.map(line => `
    <div class="cart-line">
      <div>
        <strong>${line.name}</strong><br>
        <small>Rs. ${line.price} x ${line.qty} = Rs. ${line.price * line.qty}</small>
      </div>
      <div class="qty">
        <button type="button" data-dec="${line.id}" aria-label="Remove one ${line.name}">-</button>
        <strong>${line.qty}</strong>
        <button type="button" data-inc="${line.id}" aria-label="Add one ${line.name}">+</button>
      </div>
    </div>
  `).join("") : `
    <i data-lucide="shopping-cart"></i>
    <span>Your box is empty. Add items from the menu.</span>
  `;

  qsa("[data-dec]").forEach(btn => btn.addEventListener("click", () => changeQty(Number(btn.dataset.dec), -1)));
  qsa("[data-inc]").forEach(btn => btn.addEventListener("click", () => changeQty(Number(btn.dataset.inc), 1)));
  updateOrderLink();
  if(window.lucide) lucide.createIcons();
}

function updateOrderLink(){
  const total = cart.reduce((sum,line) => sum + line.price * line.qty, 0);
  const name = qs("#customerName").value.trim();
  const time = qs("#pickupTime").value.trim();
  const phone = qs("#customerPhone").value.trim();
  const address = qs("#deliveryAddress").value.trim();
  const note = qs("#orderNote").value.trim();
  const lines = cart.length
    ? cart.map(line => `- ${line.name} x ${line.qty} = Rs. ${line.price * line.qty}`).join("\n")
    : "- I would like to order from your menu.";

  const message = [
    "Hi Roll Box! I want to place an order.",
    `Order type: ${orderMode}`,
    name ? `Name: ${name}` : "",
    phone ? `Phone: ${phone}` : "",
    time ? `${orderMode} time: ${time}` : "",
    orderMode === "Delivery" && address ? `Delivery address: ${address}` : "",
    "",
    "Items:",
    lines,
    "",
    cart.length ? `Estimated total: Rs. ${total}` : "",
    note ? `Note: ${note}` : "",
    "",
    "Please confirm availability and final bill."
  ].filter(Boolean).join("\n");

  qs("#sendOrder").href = waLink(message);
}

function setFilter(filter){
  activeFilter = filter;
  qsa(".tab").forEach(btn => btn.classList.toggle("active", btn.dataset.filter === filter));
  renderMenu();
}

function init(){
  setStaticLinks();
  renderMenu();
  renderCart();
  if(window.lucide) lucide.createIcons();

  qs("#menuToggle").addEventListener("click", () => {
    qs("#navLinks").classList.toggle("open");
    document.body.classList.toggle("menu-open");
  });

  qsa(".nav-links a").forEach(link => link.addEventListener("click", () => {
    qs("#navLinks").classList.remove("open");
    document.body.classList.remove("menu-open");
  }));

  qs("#tabs").addEventListener("click", event => {
    const tab = event.target.closest(".tab");
    if(!tab) return;
    setFilter(tab.dataset.filter);
  });

  qsa("[data-jump-filter]").forEach(link => {
    link.addEventListener("click", () => setFilter(link.dataset.jumpFilter));
  });

  qsa(".add-featured").forEach(btn => {
    btn.addEventListener("click", () => addToCart(Number(btn.dataset.id)));
  });

  qs("#menuSearch").addEventListener("input", renderMenu);
  qs("#orderHead").addEventListener("click", () => qs("#orderPanel").classList.toggle("open"));
  qs("#clearCart").addEventListener("click", () => {cart = []; renderCart();});

  qsa(".mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      orderMode = btn.dataset.mode;
      qsa(".mode-btn").forEach(item => item.classList.toggle("active", item === btn));
      document.body.classList.toggle("delivery-selected", orderMode === "Delivery");
      updateOrderLink();
    });
  });

  ["#customerName","#pickupTime","#customerPhone","#deliveryAddress","#orderNote"].forEach(id => {
    qs(id).addEventListener("input", updateOrderLink);
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:.12});
  qsa(".reveal").forEach(el => observer.observe(el));
}

init();
