import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  Search,
  X,
  LogIn,
  Phone,
  Calendar,
  LogOut,
  ShoppingCart,
} from 'lucide-react';
import { useSearchStore } from '@/stores/search-store';
import { useUserStore } from '@/stores/user-store';
import LoginDialog from '@/components/dialogs/login-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

function AvatarDropdown() {
  const { user, logout } = useUserStore();

  // 处理退出登录
  const handleLogout = () => {
    logout();
    // 清空购物车
    localStorage.removeItem('cart');
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          <AvatarFallback>
            {user?.userName?.substring(0, 2).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <p className="text-sm leading-none font-medium">
              {user?.userName || '用户'}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{user?.phoneNumber || 'N/A'}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-default focus:bg-transparent">
          <Calendar className="mr-2 h-4 w-4" />
          <span className="text-xs text-muted-foreground">
            注册时间: {formatDate(user?.created_at || '')}
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          variant="destructive"
          className="cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { searchQuery, setSearchQuery, clearSearch } = useSearchStore();
  const { isLoggedIn } = useUserStore();
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 z-50 w-screen transition-all duration-300 ${
        isScrolled
          ? 'border-b border-border bg-background/95 shadow-sm backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="text-xl font-semibold text-foreground transition-colors hover:text-primary"
          >
            买买网
          </Link>

          {/* Search Bar - hidden on mobile */}
          <div className="mx-8 hidden max-w-xs flex-1 md:flex">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="搜索商品..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg bg-secondary px-4 py-2 pr-20 text-sm text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute top-2.5 right-9 h-4 w-4 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <Search className="absolute top-2.5 right-3 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                {/* Orders Link */}
                <Link
                  to="/orders"
                  className="p-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
                >
                  我的订单
                </Link>

                {/* Cart Icon */}
                <Link
                  to="/cart"
                  className="relative p-2 text-foreground transition-colors hover:text-primary"
                >
                  <ShoppingCart className="h-6 w-6" />
                </Link>

                {/* User Avatar with Dropdown */}
                <AvatarDropdown />
              </>
            ) : (
              /* Login/Register Button */
              <Button
                onClick={() => setIsLoginDialogOpen(true)}
                variant="default"
                size="sm"
                className="gap-2"
              >
                <LogIn className="h-4 w-4" />
                登录 / 注册
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Login Dialog */}
      <LoginDialog
        open={isLoginDialogOpen}
        onOpenChange={setIsLoginDialogOpen}
      />
    </nav>
  );
}
