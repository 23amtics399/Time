import { NavLink } from 'react-router-dom';
import { TOOL_GROUPS, getToolByPath } from '../data/tools';
import { useFavorites } from '../hooks/useFavorites';
import { StarIcon } from './icons';
import './Sidebar.css';

export default function Sidebar({ open, onClose }) {
  const { favorites } = useFavorites();

  const favoriteTools = favorites
    .map(path => getToolByPath(path))
    .filter(Boolean);

  return (
    <>
      {/* Mobile backdrop */}
      {open && <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />}

      <nav
        className={`sidebar ${open ? 'sidebar--open' : ''}`}
        aria-label="Tool navigation"
      >
        <div className="sidebar-inner">
          {/* Favorites Group (if any) */}
          {favoriteTools.length > 0 && (
            <div className="sidebar-group sidebar-group--favorites">
              <p className="sidebar-group-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <StarIcon style={{ width: 12, height: 12, color: 'var(--amber)' }} filled />
                Favorites
              </p>
              <ul>
                {favoriteTools.map(tool => {
                  const Icon = tool.icon;
                  return (
                    <li key={`fav-${tool.path}`}>
                      <NavLink
                        to={tool.path}
                        className={({ isActive }) =>
                          `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
                        }
                        onClick={onClose}
                      >
                        <span className="sidebar-link-icon" aria-hidden="true">
                          <Icon />
                        </span>
                        {tool.name}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* All Categories */}
          {TOOL_GROUPS.map(group => (
            <div key={group.category} className="sidebar-group">
              <p className="sidebar-group-label">{group.category}</p>
              <ul>
                {group.tools.map(tool => {
                  const Icon = tool.icon;
                  return (
                    <li key={tool.path}>
                      <NavLink
                        to={tool.path}
                        className={({ isActive }) =>
                          `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
                        }
                        onClick={onClose}
                      >
                        <span className="sidebar-link-icon" aria-hidden="true">
                          <Icon />
                        </span>
                        {tool.name}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <p className="text-faint text-xs">time.sji.one</p>
        </div>
      </nav>
    </>
  );
}

// Export TOOLS for backwards compatibility
export const TOOLS = TOOL_GROUPS.map(group => ({
  category: group.category,
  icon: group.category.includes('Clock') ? '🕐' : group.category.includes('Timer') ? '⏱' : group.category.includes('Converter') ? '🔄' : '📅',
  items: group.tools.map(t => ({
    path: t.path,
    label: t.name,
    icon: t.icon,
  })),
}));
