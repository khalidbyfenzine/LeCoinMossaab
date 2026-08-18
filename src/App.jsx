import { useEffect, useMemo, useState } from 'react';
import { supabase } from './lib/supabaseClient.js';
import { money } from './lib/format.js';
import LoginScreen from './components/LoginScreen.jsx';
import TopBar from './components/TopBar.jsx';
import CategorySidebar from './components/cashier/CategorySidebar.jsx';
import MenuGrid from './components/cashier/MenuGrid.jsx';
import OrderTicket from './components/cashier/OrderTicket.jsx';
import AdminNav from './components/admin/AdminNav.jsx';
import Dashboard from './components/admin/Dashboard.jsx';
import OrdersAdmin from './components/admin/OrdersAdmin.jsx';
import CaisseAdmin from './components/admin/CaisseAdmin.jsx';
import MenuItemsAdmin from './components/admin/MenuItemsAdmin.jsx';
import TablesAdmin from './components/admin/TablesAdmin.jsx';
import CategoriesAdmin from './components/admin/CategoriesAdmin.jsx';
import StaffAdmin from './components/admin/StaffAdmin.jsx';

function todayLabel() {
  return new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function isToday(dateLike) {
  const d = new Date(dateLike);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function toDateInputValue(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function firstDayOfMonthValue() {
  const d = new Date();
  return toDateInputValue(new Date(d.getFullYear(), d.getMonth(), 1));
}

function lastDayOfMonthValue() {
  const d = new Date();
  return toDateInputValue(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [staffList, setStaffList] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [categories, setCategories] = useState([]);
  const [caisseTransactions, setCaisseTransactions] = useState([]);
  const [categoryAddons, setCategoryAddons] = useState([]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginRole, setLoginRole] = useState('cashier');
  const [pinTarget, setPinTarget] = useState(null);
  const [pinEntry, setPinEntry] = useState('');
  const [pinError, setPinError] = useState(false);

  const [view, setView] = useState('cashier');
  const [adminSection, setAdminSection] = useState('dashboard');
  const [category, setCategory] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [cart, setCart] = useState([]);
  const [dashboardFrom, setDashboardFrom] = useState(firstDayOfMonthValue);
  const [dashboardTo, setDashboardTo] = useState(lastDayOfMonthValue);
  const [ordersFrom, setOrdersFrom] = useState(firstDayOfMonthValue);
  const [ordersTo, setOrdersTo] = useState(lastDayOfMonthValue);
  const [ordersStatusFilter, setOrdersStatusFilter] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const [
          { data: staffData, error: staffErr },
          { data: menuData, error: menuErr },
          { data: orderData, error: orderErr },
          { data: tableData, error: tableErr },
          { data: categoryData, error: categoryErr },
          { data: caisseData, error: caisseErr },
          { data: addonData, error: addonErr },
        ] = await Promise.all([
          supabase.from('staff_public').select('*'),
          supabase.from('menu_items').select('*'),
          supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }),
          supabase.from('tables').select('*').order('id', { ascending: true }),
          supabase.from('categories').select('*').order('id', { ascending: true }),
          supabase.from('caisse_transactions').select('*').order('created_at', { ascending: false }),
          supabase.from('category_addons').select('*'),
        ]);
        if (staffErr) throw staffErr;
        if (menuErr) throw menuErr;
        if (orderErr) throw orderErr;
        if (tableErr) throw tableErr;
        if (categoryErr) throw categoryErr;
        if (caisseErr) throw caisseErr;
        if (addonErr) throw addonErr;

        setStaffList(staffData ?? []);
        setMenuItems(menuData ?? []);
        setTables(tableData ?? []);
        setSelectedTable((tableData ?? [])[3]?.label ?? (tableData ?? [])[0]?.label ?? null);
        setCategories(categoryData ?? []);
        setCategory((categoryData ?? [])[0]?.label ?? null);
        setCaisseTransactions(
          (caisseData ?? []).map((t) => ({ ...t, amount: Number(t.amount) }))
        );
        setCategoryAddons((addonData ?? []).map((a) => ({ ...a, price: Number(a.price) })));
        setOrders(
          (orderData ?? []).map((o) => ({
            id: o.id,
            table_label: o.table_label,
            server_name: o.server_name,
            status: o.status,
            covers: o.covers,
            created_at: o.created_at,
            items: (o.order_items ?? []).map((it) => ({
              id: it.id,
              menu_item_id: it.menu_item_id,
              name: it.name,
              price: Number(it.price),
              qty: it.qty,
            })),
          }))
        );
      } catch (err) {
        setLoadError(err.message ?? String(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (tables.length === 0) return;
    if (!tables.some((t) => t.label === selectedTable)) {
      setSelectedTable(tables[0].label);
    }
  }, [tables, selectedTable]);

  useEffect(() => {
    if (categories.length === 0) return;
    if (!categories.some((c) => c.label === category)) {
      setCategory(categories[0].label);
    }
  }, [categories, category]);

  const setLoginRoleAndReset = (role) => {
    setLoginRole(role);
    setPinTarget(null);
    setPinEntry('');
    setPinError(false);
  };

  const selectPerson = (person) => {
    setPinTarget(person);
    setPinEntry('');
    setPinError(false);
  };

  const cancelPin = () => {
    setPinTarget(null);
    setPinEntry('');
    setPinError(false);
  };

  const pressDigit = async (d) => {
    if (!pinTarget) return;
    if (d === 'clear') {
      setPinEntry('');
      setPinError(false);
      return;
    }
    if (d === '') return;

    const next = pinEntry + d;
    if (next.length < 4) {
      setPinEntry(next);
      setPinError(false);
      return;
    }

    const { data, error } = await supabase.rpc('check_staff_pin', { p_staff_id: pinTarget.id, p_pin: next });
    if (!error && data && data.length > 0) {
      const person = data[0];
      setCurrentUser(person);
      setIsLoggedIn(true);
      setView(person.login_role);
      setPinTarget(null);
      setPinEntry('');
      setPinError(false);
    } else {
      setPinEntry('');
      setPinError(true);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setPinTarget(null);
    setPinEntry('');
  };

  const addToCart = (item, selectedAddons = []) => {
    const addonsKey = selectedAddons.map((a) => a.name).sort().join('|');
    const lineKey = `${item.id}::${addonsKey}`;
    const unitPrice = Number(item.price) + selectedAddons.reduce((sum, a) => sum + Number(a.price), 0);
    const displayName =
      selectedAddons.length > 0 ? `${item.name} + ${selectedAddons.map((a) => a.name).join(', ')}` : item.name;

    setCart((prev) => {
      const existing = prev.find((c) => c.lineKey === lineKey);
      if (existing) {
        return prev.map((c) => (c.lineKey === lineKey ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { lineKey, id: item.id, name: displayName, price: unitPrice, qty: 1, category: item.category }];
    });
  };

  const incQty = (lineKey) =>
    setCart((prev) => prev.map((c) => (c.lineKey === lineKey ? { ...c, qty: c.qty + 1 } : c)));
  const decQty = (lineKey) =>
    setCart((prev) => prev.map((c) => (c.lineKey === lineKey ? { ...c, qty: c.qty - 1 } : c)).filter((c) => c.qty > 0));

  const finalizeOrder = async () => {
    if (cart.length === 0 || !selectedTable) throw new Error('Panier vide.');

    const { data: newOrder, error: orderErr } = await supabase
      .from('orders')
      .insert({ table_label: selectedTable, server_name: currentUser.name, status: 'paid', covers: 1 })
      .select()
      .single();
    if (orderErr) throw orderErr;

    const itemRows = cart.map((c) => ({ order_id: newOrder.id, menu_item_id: c.id, name: c.name, price: c.price, qty: c.qty }));
    const { data: newItems, error: itemsErr } = await supabase.from('order_items').insert(itemRows).select();
    if (itemsErr) throw itemsErr;

    setOrders((prev) => [
      {
        id: newOrder.id,
        table_label: newOrder.table_label,
        server_name: newOrder.server_name,
        status: newOrder.status,
        covers: newOrder.covers,
        created_at: newOrder.created_at,
        items: newItems.map((it) => ({ id: it.id, menu_item_id: it.menu_item_id, name: it.name, price: Number(it.price), qty: it.qty })),
      },
      ...prev,
    ]);

    const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
    const { data: txData, error: txErr } = await supabase
      .from('caisse_transactions')
      .insert({
        type: 'in',
        amount: total,
        description: `Commande ${selectedTable}`,
        order_id: newOrder.id,
        created_by: currentUser?.name ?? null,
      })
      .select()
      .single();
    if (!txErr && txData) {
      setCaisseTransactions((prev) => [{ ...txData, amount: Number(txData.amount) }, ...prev]);
    }

    setCart([]);

    return { id: newOrder.id, createdAt: newOrder.created_at };
  };

  // items: current edited line list for this order, each { id, qty }; qty <= 0 removes the line.
  const updateOrder = async (id, { table_label, server_name, status, items }) => {
    const { error: orderErr } = await supabase
      .from('orders')
      .update({ table_label, server_name, status })
      .eq('id', id);
    if (orderErr) throw orderErr;

    const toRemove = items.filter((it) => it.qty <= 0).map((it) => it.id);
    const toKeep = items.filter((it) => it.qty > 0);

    if (toRemove.length > 0) {
      const { error } = await supabase.from('order_items').delete().in('id', toRemove);
      if (error) throw error;
    }
    for (const it of toKeep) {
      const { error } = await supabase.from('order_items').update({ qty: it.qty }).eq('id', it.id);
      if (error) throw error;
    }

    let updatedItems;
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const keepQtyById = new Map(toKeep.map((it) => [it.id, it.qty]));
        updatedItems = o.items
          .filter((it) => !toRemove.includes(it.id))
          .map((it) => (keepQtyById.has(it.id) ? { ...it, qty: keepQtyById.get(it.id) } : it));
        return { ...o, table_label, server_name, status, items: updatedItems };
      })
    );

    // Keep the linked caisse entry (if any) in sync with the corrected total.
    const newTotal = (updatedItems ?? []).reduce((sum, it) => sum + it.price * it.qty, 0);
    const linkedTx = caisseTransactions.find((t) => t.order_id === id);
    if (linkedTx) {
      const { error } = await supabase.from('caisse_transactions').update({ amount: newTotal }).eq('id', linkedTx.id);
      if (!error) {
        setCaisseTransactions((prev) => prev.map((t) => (t.id === linkedTx.id ? { ...t, amount: newTotal } : t)));
      }
    }
  };

  const deleteOrder = async (id) => {
    await supabase.from('caisse_transactions').delete().eq('order_id', id);
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) return;
    setOrders((prev) => prev.filter((o) => o.id !== id));
    setCaisseTransactions((prev) => prev.filter((t) => t.order_id !== id));
  };

  const toggleAvailable = async (id) => {
    const item = menuItems.find((m) => m.id === id);
    if (!item) return;
    const nextAvailable = !item.available;
    setMenuItems((prev) => prev.map((m) => (m.id === id ? { ...m, available: nextAvailable } : m)));
    await supabase.from('menu_items').update({ available: nextAvailable }).eq('id', id);
  };

  const addMenuItem = async ({ name, category, price, image_url }) => {
    const id = crypto.randomUUID();
    const { data, error } = await supabase
      .from('menu_items')
      .insert({ id, name, category, price, available: true, image_url: image_url ?? null })
      .select()
      .single();
    if (error) throw error;
    setMenuItems((prev) => [...prev, data]);
  };

  const updateMenuItem = async (id, fields) => {
    const { data, error } = await supabase.from('menu_items').update(fields).eq('id', id).select().single();
    if (error) throw error;
    setMenuItems((prev) => prev.map((m) => (m.id === id ? data : m)));
  };

  const deleteMenuItem = async (id) => {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) return;
    setMenuItems((prev) => prev.filter((m) => m.id !== id));
  };

  const addCategoryAddon = async (categoryId, { name, price }) => {
    const { data, error } = await supabase
      .from('category_addons')
      .insert({ category_id: categoryId, name, price })
      .select()
      .single();
    if (error) return;
    setCategoryAddons((prev) => [...prev, { ...data, price: Number(data.price) }]);
  };

  const deleteCategoryAddon = async (addonId) => {
    const { error } = await supabase.from('category_addons').delete().eq('id', addonId);
    if (error) return;
    setCategoryAddons((prev) => prev.filter((a) => a.id !== addonId));
  };

  const toggleStaffClock = async (id) => {
    const person = staffList.find((s) => s.id === id);
    if (!person) return;
    const nextClockedIn = !person.clocked_in;
    setStaffList((prev) => prev.map((s) => (s.id === id ? { ...s, clocked_in: nextClockedIn } : s)));
    await supabase.rpc('set_staff_clocked_in', { p_staff_id: id, p_clocked_in: nextClockedIn });
  };

  const addStaff = async ({ name, role, login_role, pin }) => {
    const id = crypto.randomUUID();
    const { error } = await supabase.from('staff').insert({ id, name, role, login_role, pin, clocked_in: false });
    if (error) return;
    setStaffList((prev) => [...prev, { id, name, role, login_role, clocked_in: false }]);
  };

  const updateStaff = async (id, fields) => {
    const { pin, ...displayFields } = fields;
    setStaffList((prev) => prev.map((s) => (s.id === id ? { ...s, ...displayFields } : s)));
    await supabase.from('staff').update(fields).eq('id', id);
  };

  const deleteStaff = async (id) => {
    const { error } = await supabase.from('staff').delete().eq('id', id);
    if (error) return;
    setStaffList((prev) => prev.filter((s) => s.id !== id));
  };

  const addTable = async (label) => {
    const { data, error } = await supabase.from('tables').insert({ label }).select().single();
    if (error) return;
    setTables((prev) => [...prev, data]);
  };

  const removeTable = async (id) => {
    const { error } = await supabase.from('tables').delete().eq('id', id);
    if (error) return;
    setTables((prev) => prev.filter((t) => t.id !== id));
  };

  const addCategory = async (label) => {
    const { data, error } = await supabase.from('categories').insert({ label }).select().single();
    if (error) return;
    setCategories((prev) => [...prev, data]);
  };

  const removeCategory = async (id) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) return;
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setCategoryAddons((prev) => prev.filter((a) => a.category_id !== id));
  };

  const updateCategory = async (id, newLabel) => {
    const oldLabel = categories.find((c) => c.id === id)?.label;
    if (!oldLabel || oldLabel === newLabel) return;

    const { error } = await supabase.from('categories').update({ label: newLabel }).eq('id', id);
    if (error) return;
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, label: newLabel } : c)));

    // Reassign existing items so a rename doesn't silently orphan them.
    await supabase.from('menu_items').update({ category: newLabel }).eq('category', oldLabel);
    setMenuItems((prev) => prev.map((m) => (m.category === oldLabel ? { ...m, category: newLabel } : m)));
  };

  const addCaisseTransaction = async ({ type, amount, description }) => {
    const { data, error } = await supabase
      .from('caisse_transactions')
      .insert({ type, amount, description, order_id: null, created_by: currentUser?.name ?? null })
      .select()
      .single();
    if (error) return;
    setCaisseTransactions((prev) => [{ ...data, amount: Number(data.amount) }, ...prev]);
  };

  const deleteCaisseTransaction = async (id) => {
    const { error } = await supabase.from('caisse_transactions').delete().eq('id', id);
    if (error) return;
    setCaisseTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const filteredItems = useMemo(() => menuItems.filter((m) => m.category === category), [menuItems, category]);

  const addonsByCategoryId = useMemo(() => {
    const map = {};
    for (const a of categoryAddons) {
      (map[a.category_id] ??= []).push(a);
    }
    return map;
  }, [categoryAddons]);

  const addonsByCategoryLabel = useMemo(() => {
    const map = {};
    for (const c of categories) {
      map[c.label] = addonsByCategoryId[c.id] ?? [];
    }
    return map;
  }, [categories, addonsByCategoryId]);

  const total = useMemo(() => cart.reduce((sum, c) => sum + c.price * c.qty, 0), [cart]);

  const todaysOrders = useMemo(() => orders.filter((o) => isToday(o.created_at)), [orders]);

  const tableLabels = useMemo(() => tables.map((t) => t.label), [tables]);
  const categoryLabels = useMemo(() => categories.map((c) => c.label), [categories]);

  const dashboardStats = useMemo(() => {
    const sales = todaysOrders.reduce((sum, o) => sum + o.items.reduce((s, it) => s + it.price * it.qty, 0), 0);
    const ordersCount = todaysOrders.length;

    const qtyByName = {};
    for (const o of todaysOrders) {
      for (const it of o.items) {
        qtyByName[it.name] = (qtyByName[it.name] ?? 0) + it.qty;
      }
    }
    const topEntry = Object.entries(qtyByName).sort((a, b) => b[1] - a[1])[0];

    return {
      salesDisplay: money(sales),
      ordersCount,
      topItemName: topEntry ? topEntry[0] : '—',
      topItemQty: topEntry ? topEntry[1] : 0,
    };
  }, [todaysOrders]);

  const dailyBars = useMemo(() => {
    const from = new Date(`${dashboardFrom}T00:00:00`);
    const to = new Date(`${dashboardTo}T00:00:00`);
    if (isNaN(from) || isNaN(to) || from > to) return [];

    const days = [];
    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }

    const totalsByKey = {};
    for (const o of orders) {
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const total = o.items.reduce((sum, it) => sum + it.price * it.qty, 0);
      totalsByKey[key] = (totalsByKey[key] ?? 0) + total;
    }

    const sums = days.map((d) => {
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      return { date: d, total: totalsByKey[key] ?? 0 };
    });

    const max = Math.max(1, ...sums.map((s) => s.total));
    return sums.map((s) => ({
      label: `${s.date.getDate()}/${s.date.getMonth() + 1}`,
      dateDisplay: s.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      totalDisplay: money(s.total),
      heightPx: Math.round((s.total / max) * 90) + 'px',
    }));
  }, [orders, dashboardFrom, dashboardTo]);

  const filteredOrders = useMemo(() => {
    const from = new Date(`${ordersFrom}T00:00:00`);
    const to = new Date(`${ordersTo}T23:59:59`);
    return orders
      .filter((o) => {
        if (ordersStatusFilter !== 'all' && o.status !== ordersStatusFilter) return false;
        // Open orders are pending business — always show them regardless of the
        // date range so admin never loses track of an unpaid order.
        if (o.status === 'open') return true;
        const d = new Date(o.created_at);
        if (!isNaN(from) && d < from) return false;
        if (!isNaN(to) && d > to) return false;
        return true;
      })
      .map((o) => {
        const itemCount = o.items.reduce((sum, it) => sum + it.qty, 0);
        const orderTotal = o.items.reduce((sum, it) => sum + it.price * it.qty, 0);
        return {
          id: o.id,
          table: o.table_label,
          server: o.server_name,
          status: o.status,
          dateDisplay: new Date(o.created_at).toLocaleString('fr-FR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          }),
          itemsLabel: `${itemCount} article${itemCount === 1 ? '' : 's'}`,
          totalDisplay: money(orderTotal),
          paid: o.status === 'paid',
          items: o.items,
        };
      });
  }, [orders, ordersFrom, ordersTo, ordersStatusFilter]);

  const caisseBalance = useMemo(
    () => caisseTransactions.reduce((sum, t) => sum + (t.type === 'in' ? t.amount : -t.amount), 0),
    [caisseTransactions]
  );

  const caisseTransactionsDisplay = useMemo(
    () =>
      caisseTransactions.map((t) => ({
        id: t.id,
        type: t.type,
        amountDisplay: money(t.amount),
        description: t.description,
        dateDisplay: new Date(t.created_at).toLocaleString('fr-FR', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
        createdBy: t.created_by,
        linkedToOrder: t.order_id != null,
      })),
    [caisseTransactions]
  );

  if (loading) {
    return <div style={{ padding: 40, fontFamily: 'var(--font-sans)' }}>Chargement…</div>;
  }

  if (loadError) {
    return (
      <div style={{ padding: 40, fontFamily: 'var(--font-sans)', color: 'var(--color-accent)' }}>
        Échec du chargement des données : {loadError}. Vérifiez votre URL/clé Supabase dans .env et que
        supabase/schema.sql a bien été exécuté.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', color: 'var(--color-text)' }}>
      {!isLoggedIn && (
        <LoginScreen
          loginRole={loginRole}
          onSetLoginRole={setLoginRoleAndReset}
          staffList={staffList}
          pinTarget={pinTarget}
          pinEntry={pinEntry}
          pinError={pinError}
          onSelectPerson={selectPerson}
          onDigit={pressDigit}
          onCancelPin={cancelPin}
        />
      )}

      {isLoggedIn && (
        <>
          <TopBar
            view={view}
            onGoCashier={() => setView('cashier')}
            onGoAdmin={() => setView('admin')}
            isCashier={view === 'cashier'}
            canAccessAdmin={currentUser?.login_role === 'admin'}
            tables={tableLabels}
            selectedTable={selectedTable}
            onSelectTable={setSelectedTable}
            todayLabel={todayLabel()}
            currentUserName={currentUser?.name}
            onLogout={logout}
          />

          {view === 'cashier' && (
            <div className="cashier-body" style={{ flex: 1, display: 'flex', minHeight: 0 }}>
              <CategorySidebar categories={categoryLabels} category={category} onSelectCategory={setCategory} />
              <MenuGrid items={filteredItems} addonsByCategoryLabel={addonsByCategoryLabel} onAdd={addToCart} />
              <OrderTicket
                selectedTable={selectedTable}
                cart={cart}
                onInc={incQty}
                onDec={decQty}
                total={total}
                onFinalizeOrder={finalizeOrder}
                serverName={currentUser?.name}
              />
            </div>
          )}

          {view === 'admin' && currentUser?.login_role === 'admin' && (
            <div className="admin-body" style={{ flex: 1, display: 'flex', minHeight: 0 }}>
              <AdminNav adminSection={adminSection} onSelect={setAdminSection} />
              <div className="admin-content" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '28px 32px' }}>
                {adminSection === 'dashboard' && (
                  <Dashboard
                    todayLabel={todayLabel()}
                    stats={dashboardStats}
                    dailyBars={dailyBars}
                    dashboardFrom={dashboardFrom}
                    dashboardTo={dashboardTo}
                    onDashboardFromChange={setDashboardFrom}
                    onDashboardToChange={setDashboardTo}
                  />
                )}
                {adminSection === 'orders' && (
                  <OrdersAdmin
                    orders={filteredOrders}
                    tables={tableLabels}
                    ordersFrom={ordersFrom}
                    ordersTo={ordersTo}
                    statusFilter={ordersStatusFilter}
                    onFromChange={setOrdersFrom}
                    onToChange={setOrdersTo}
                    onStatusFilterChange={setOrdersStatusFilter}
                    onUpdate={updateOrder}
                    onDelete={deleteOrder}
                  />
                )}
                {adminSection === 'caisse' && (
                  <CaisseAdmin
                    balanceDisplay={money(caisseBalance)}
                    transactions={caisseTransactionsDisplay}
                    onAdd={addCaisseTransaction}
                    onDelete={deleteCaisseTransaction}
                  />
                )}
                {adminSection === 'menu' && (
                  <MenuItemsAdmin
                    items={menuItems}
                    categories={categoryLabels}
                    onToggle={toggleAvailable}
                    onAdd={addMenuItem}
                    onUpdate={updateMenuItem}
                    onDelete={deleteMenuItem}
                  />
                )}
                {adminSection === 'categories' && (
                  <CategoriesAdmin
                    categories={categories}
                    addonsByCategoryId={addonsByCategoryId}
                    onAdd={addCategory}
                    onRemove={removeCategory}
                    onUpdate={updateCategory}
                    onAddAddon={addCategoryAddon}
                    onDeleteAddon={deleteCategoryAddon}
                  />
                )}
                {adminSection === 'tables' && <TablesAdmin tables={tables} onAdd={addTable} onRemove={removeTable} />}
                {adminSection === 'staff' && (
                  <StaffAdmin
                    staff={staffList}
                    onToggleClock={toggleStaffClock}
                    onAdd={addStaff}
                    onUpdate={updateStaff}
                    onDelete={deleteStaff}
                  />
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
