import { LayoutDashboard, ShoppingBag, Settings2, Package2, Mail, ArrowUpRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

const links = [['Dashboard', LayoutDashboard], ['Orders', ShoppingBag], ['Settings', Settings2]]

export default function Sidebar({ page, setPage, collapsed, onToggle }) {
  return <aside className={`sidebar${collapsed ? ' sidebar-collapsed' : ''}`}>
    <div className="sidebar-brand-row">
      <div className="brand">
        <div className="brand-icon"><Package2 size={23} /></div>
        {<div className="brand-label"><strong>ottokonek<span className="brand-period">.</span></strong><small>ORDER MANAGER</small></div>}
      </div>
      <button type="button" className="sidebar-toggle" onClick={onToggle} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed}>
        <PanelLeftClose size={19} className="toggle-glyph" />
      </button>
    </div>
    <div className="side-section">WORKSPACE</div>
    <nav aria-label="Main navigation">
      {links.map(([name, Icon]) => <button key={name} title={collapsed ? name : undefined} aria-label={name} aria-current={page === name ? 'page' : undefined} className={'nav-link ' + (page === name ? 'active' : '')} onClick={() => setPage(name)}>
        <Icon size={19} strokeWidth={1.9} /><span className="nav-label">{name}</span>{page === name && <span className="nav-active-mark" />}
      </button>)}
    </nav>
    <div className="sidebar-spacer" />
    <div className="side-section">INTEGRATIONS</div>
    <button title={collapsed ? 'Gmail inbox settings' : undefined} aria-label="Gmail inbox settings" className="integration-link" onClick={() => setPage('Settings')}>
      <span className="integration-icon"><Mail size={18} /></span>
      <span className="integration-label"><strong>Gmail inbox</strong><small>Setup required</small></span>
      <ArrowUpRight className="integration-arrow" size={16} />
    </button>
    <div className="sidebar-footer"><span className="avatar">O</span><div className="footer-label"><strong>Ottokonek workspace</strong><small>Administrator</small></div></div>
  </aside>
}
