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
import MenuItemsAdmin from './components/admin/MenuItemsAdmin.jsx';
import TablesAdmin from './components/admin/TablesAdmin.jsx';
import CategoriesAdmin from './components/admin/CategoriesAdmin.jsx';
import StaffAdmin from './components/admin/StaffAdmin.jsx';

const HOUR_BUCKETS = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((h) => ({
  h,
  label: `${h}h`,
}));
const TAX_RATE = 0.0825;

function todayLabel() {
  return new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function isToday(dateLike) {
  const d = new Date(dateLike);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [staffList, setStaffList] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [categories, setCategories] = useState([]);

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

  useEffect(() => {
    async function load() {
      try {
        const [
          { data: staffData, error: staffErr },
          { data: menuData, error: menuErr },
          { data: orderData, error: orderErr },
          { data: tableData, error: tableErr },
          { data: categoryData, error: categoryErr },
        ] = await Promise.all([
          supabase.from('staff_public').select('*'),
          supabase.from('menu_items').select('*'),
          supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }),
          supabase.from('tables').select('*').order('id', { ascending: true }),
          supabase.from('categories').select('*').order('id', { ascending: true }),
        ]);
        if (staffErr) throw staffErr;
        if (menuErr) throw menuErr;
        if (orderErr) throw orderErr;
        if (tableErr) throw tableErr;
        if (categoryErr) throw categoryErr;

        setStaffList(staffData ?? []);
        setMenuItems(menuData ?? []);
        setTables(tableData ?? []);
        setSelectedTable((tableData ?? [])[3]?.label ?? (tableData ?? [])[0]?.label ?? null);
        setCategories(categoryData ?? []);
        setCategory((categoryData ?? [])[0]?.label ?? null);
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

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { id: item.id, name: item.name, price: Number(item.price), qty: 1 }];
    });
  };

  const incQty = (id) => setCart((prev) => prev.map((c) => (c.id === id ? { ...c, qty: c.qty + 1 } : c)));
  const decQty = (id) =>
    setCart((prev) => prev.map((c) => (c.id === id ? { ...c, qty: c.qty - 1 } : c)).filter((c) => c.qty > 0));

  const sendToKitchen = async () => {
    if (cart.length === 0 || !selectedTable) return;
    const { data: newOrder, error: orderErr } = await supabase
      .from('orders')
      .insert({ table_label: selectedTable, server_name: currentUser.name, status: 'open', covers: 1 })
      .select()
      .single();
    if (orderErr) return;

    const itemRows = cart.map((c) => ({ order_id: newOrder.id, menu_item_id: c.id, name: c.name, price: c.price, qty: c.qty }));
    const { data: newItems, error: itemsErr } = await supabase.from('order_items').insert(itemRows).select();
    if (itemsErr) return;

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
    setCart([]);
  };

  const editOrder = async (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) return;
    setCart(order.items.map((it) => ({ id: it.menu_item_id, name: it.name, price: it.price, qty: it.qty })));
    setSelectedTable(order.table_label);
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const toggleAvailable = async (id) => {
    const item = menuItems.find((m) => m.id === id);
    if (!item) return;
    const nextAvailable = !item.available;
    setMenuItems((prev) => prev.map((m) => (m.id === id ? { ...m, available: nextAvailable } : m)));
    await supabase.from('menu_items').update({ available: nextAvailable }).eq('id', id);
  };

  const addMenuItem = async ({ name, category, price }) => {
    const id = crypto.randomUUID();
    const { data, error } = await supabase
      .from('menu_items')
      .insert({ id, name, category, price, available: true })
      .select()
      .single();
    if (error) return;
    setMenuItems((prev) => [...prev, data]);
  };

  const updateMenuItem = async (id, fields) => {
    setMenuItems((prev) => prev.map((m) => (m.id === id ? { ...m, ...fields } : m)));
    await supabase.from('menu_items').update(fields).eq('id', id);
  };

  const deleteMenuItem = async (id) => {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) return;
    setMenuItems((prev) => prev.filter((m) => m.id !== id));
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
  };

  const filteredItems = useMemo(() => menuItems.filter((m) => m.category === category), [menuItems, category]);

  const subtotal = useMemo(() => cart.reduce((sum, c) => sum + c.price * c.qty, 0), [cart]);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const todaysOrders = useMemo(() => orders.filter((o) => isToday(o.created_at)), [orders]);

  const tableOrders = useMemo(
    () => todaysOrders.filter((o) => o.table_label === selectedTable),
    [todaysOrders, selectedTable]
  );

  const tableLabels = useMemo(() => tables.map((t) => t.label), [tables]);
  const categoryLabels = useMemo(() => categories.map((c) => c.label), [categories]);

  const dashboardStats = useMemo(() => {
    const sales = todaysOrders.reduce((sum, o) => sum + o.items.reduce((s, it) => s + it.price * it.qty, 0), 0);
    const ordersCount = todaysOrders.length;
    const avgTicket = ordersCount > 0 ? sales / ordersCount : 0;
    const covers = todaysOrders.reduce((sum, o) => sum + (o.covers ?? 0), 0);
    return {
      salesDisplay: money(sales),
      ordersCount,
      avgTicketDisplay: money(avgTicket),
      covers,
    };
  }, [todaysOrders]);

  const hourlyBars = useMemo(() => {
    const sums = HOUR_BUCKETS.map((b) => {
      const total = todaysOrders
        .filter((o) => new Date(o.created_at).getHours() === b.h)
        .reduce((sum, o) => sum + o.items.reduce((s, it) => s + it.price * it.qty, 0), 0);
      return { ...b, total };
    });
    const max = Math.max(1, ...sums.map((s) => s.total));
    return sums.map((s) => ({ label: s.label, heightPx: Math.round((s.total / max) * 90) + 'px' }));
  }, [todaysOrders]);

  const recentOrders = useMemo(
    () =>
      orders.slice(0, 8).map((o) => {
        const itemCount = o.items.reduce((sum, it) => sum + it.qty, 0);
        const orderTotal = o.items.reduce((sum, it) => sum + it.price * it.qty, 0);
        return {
          id: o.id,
          table: o.table_label,
          server: o.server_name,
          itemsLabel: `${itemCount} article${itemCount === 1 ? '' : 's'}`,
          totalDisplay: money(orderTotal),
          paid: o.status === 'paid',
        };
      }),
    [orders]
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
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: 'var(--color-text)' }}>
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
            <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
              <CategorySidebar categories={categoryLabels} category={category} onSelectCategory={setCategory} />
              <MenuGrid items={filteredItems} onAdd={addToCart} />
              <OrderTicket
                selectedTable={selectedTable}
                cart={cart}
                onInc={incQty}
                onDec={decQty}
                subtotal={subtotal}
                tax={tax}
                total={total}
                onSendToKitchen={sendToKitchen}
                tableOrders={tableOrders}
                onEditOrder={editOrder}
              />
            </div>
          )}

          {view === 'admin' && currentUser?.login_role === 'admin' && (
            <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
              <AdminNav adminSection={adminSection} onSelect={setAdminSection} />
              <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
                {adminSection === 'dashboard' && (
                  <Dashboard todayLabel={todayLabel()} stats={dashboardStats} hourlyBars={hourlyBars} recentOrders={recentOrders} />
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
                  <CategoriesAdmin categories={categories} onAdd={addCategory} onRemove={removeCategory} />
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
