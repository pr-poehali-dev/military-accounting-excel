import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import Icon from '@/components/ui/icon';

const Navigation = () => {
  const location = useLocation();

  const links = [
    { href: '/', label: 'Панель', icon: 'LayoutDashboard' },
    { href: '/registry', label: 'Реестр', icon: 'Users' },
  ];

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center">
          <div className="flex items-center gap-2 mr-8">
            <Icon name="Shield" size={28} className="text-primary" />
            <span className="font-bold text-xl">ПВД Учёт</span>
          </div>
          
          <div className="flex gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  location.pathname === link.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <Icon name={link.icon as any} size={18} />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
