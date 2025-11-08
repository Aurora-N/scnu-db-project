import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useUserStore } from '@/stores/user-store';
import { toast } from 'sonner';
import { AuthApi, type AuthResponseData } from '@/api/auth-api';
import { UserApi } from '@/api/user-api';
import { validateCNPhoneNumber as validatePhoneNumber } from '@/utils/valiation';

interface TabsDemoProps {
  onTabChange?: (tab: string) => void;
}

function TabsDemo({ onTabChange }: TabsDemoProps) {
  // 使用userStore
  const { login: loginUser } = useUserStore();

  // 登录表单状态
  const [loginForm, setLoginForm] = useState({
    phone_number: '',
    password: '',
  });

  // 注册表单状态
  const [registerForm, setRegisterForm] = useState({
    phone_number: '',
    userName: '', // 添加用户名字段
    password: '',
    confirmPassword: '',
  });

  // 表单错误状态
  const [errors, setErrors] = useState({
    loginPhoneNumber: '',
    loginPassword: '',
    registerPhoneNumber: '',
    registerUserName: '',
    registerPassword: '',
    registerConfirm: '',
  });

  // 表单提交状态
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 登录/注册成功状态
  const [isSuccess, setIsSuccess] = useState(false);

  // 处理 tab 变化
  const handleTabChange = (value: string) => {
    if (onTabChange) {
      onTabChange(value);
    }
  };

  // 处理登录表单变化
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setLoginForm({
      ...loginForm,
      [id === 'login-phone-number' ? 'phone_number' : 'password']: value,
    });

    // 清除对应的错误信息
    if (id === 'login-phone-number') {
      setErrors({ ...errors, loginPhoneNumber: '' });
    } else if (id === 'login-password') {
      setErrors({ ...errors, loginPassword: '' });
    }
  };

  // 处理注册表单变化
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    let field = '';

    if (id === 'register-phone-number') field = 'phone_number';
    else if (id === 'register-username') field = 'userName';
    else if (id === 'register-password') field = 'password';
    else if (id === 'register-confirm') field = 'confirmPassword';

    setRegisterForm({
      ...registerForm,
      [field]: value,
    });

    // 清除对应的错误信息
    if (id === 'register-phone-number') {
      setErrors({ ...errors, registerPhoneNumber: '' });
    } else if (id === 'register-username') {
      setErrors({ ...errors, registerUserName: '' });
    } else if (id === 'register-password') {
      setErrors({ ...errors, registerPassword: '' });
    } else if (id === 'register-confirm') {
      setErrors({ ...errors, registerConfirm: '' });
    }
  };

  // 处理用户信息获取与store设置
  const handleUserInfoSet = async (response: AuthResponseData) => {
    useUserStore.setState({ token: response.token });
    // 获取用户信息
    const userInfo = await UserApi.getUserById(response.userId);

    if (userInfo) {
      // 存储用户信息到store
      loginUser(
        {
          userId: userInfo.user.user_id,
          userName: userInfo.user.username,
          phoneNumber: userInfo.user.phone_number,
          avatar: '',
        },
        response.token
      );

      setIsSuccess(true);
      toast.success(`${userInfo.user.username}，欢迎回来！`);
    }
  };

  // 处理登录提交
  const handleLoginSubmit = async () => {
    let valid = true;
    const newErrors = { ...errors };

    if (!loginForm.phone_number) {
      newErrors.loginPhoneNumber = '请输入手机号';
      valid = false;
    } else if (!validatePhoneNumber(loginForm.phone_number)) {
      newErrors.loginPhoneNumber = '请输入有效的11位大陆手机号';
      valid = false;
    }

    if (!loginForm.password) {
      newErrors.loginPassword = '请输入密码';
      valid = false;
    }

    setErrors(newErrors);

    if (valid) {
      setIsSubmitting(true);

      try {
        // 调用登录API
        const response = await AuthApi.login(
          loginForm.phone_number,
          loginForm.password
        );

        if (response) {
          await handleUserInfoSet(response);
        }
      } catch (error) {
        console.error('登录失败:', error);
        toast.error('请检查输入的手机号或密码');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // 处理注册提交
  const handleRegisterSubmit = async () => {
    let valid = true;
    const newErrors = { ...errors };

    if (!registerForm.phone_number) {
      newErrors.registerPhoneNumber = '请输入手机号';
      valid = false;
    } else if (!validatePhoneNumber(registerForm.phone_number)) {
      newErrors.registerPhoneNumber = '请输入有效的11位大陆手机号';
      valid = false;
    }

    if (!registerForm.userName) {
      newErrors.registerUserName = '请输入用户名';
      valid = false;
    }

    if (!registerForm.password) {
      newErrors.registerPassword = '请输入密码';
      valid = false;
    } else if (registerForm.password.length < 6) {
      newErrors.registerPassword = '密码长度至少为6位';
      valid = false;
    }

    if (!registerForm.confirmPassword) {
      newErrors.registerConfirm = '请确认密码';
      valid = false;
    } else if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.registerConfirm = '两次输入的密码不一致';
      valid = false;
    }

    setErrors(newErrors);

    if (valid) {
      setIsSubmitting(true);

      try {
        // 调用注册API
        const response = await AuthApi.register(
          registerForm.userName,
          registerForm.phone_number,
          registerForm.password
        );

        if (response) {
          await handleUserInfoSet(response);
        }
      } catch (error) {
        console.error('注册失败:', error);
        toast.error('注册过程中出现错误，请重试');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Tabs defaultValue="login" onValueChange={handleTabChange}>
      <TabsList className="mb-2 grid w-full grid-cols-2">
        <TabsTrigger value="login">登录</TabsTrigger>
        <TabsTrigger value="register">注册</TabsTrigger>
      </TabsList>
      <TabsContent value="login" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="login-phone-number">手机号</Label>
          <Input
            id="login-phone-number"
            type="text"
            placeholder="请输入手机号"
            value={loginForm.phone_number}
            onChange={handleLoginChange}
            className={cn(errors.loginPhoneNumber && 'border-danger')}
          />
          {errors.loginPhoneNumber && (
            <p className="text-danger text-sm">{errors.loginPhoneNumber}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="login-password">密码</Label>
          <Input
            id="login-password"
            type="password"
            placeholder="请输入密码"
            value={loginForm.password}
            onChange={handleLoginChange}
            className={cn(errors.loginPassword && 'border-danger')}
          />
          {errors.loginPassword && (
            <p className="text-danger text-sm">{errors.loginPassword}</p>
          )}
        </div>
        <div className="mt-8 flex items-center justify-between">
          <Button className="pl-0" variant="link">
            忘记密码
          </Button>
          <Button
            className="px-8"
            onClick={handleLoginSubmit}
            disabled={isSubmitting || isSuccess}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? '登录中...' : '登录'}
          </Button>
        </div>
      </TabsContent>
      <TabsContent value="register" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="register-phone-number">手机号</Label>
          <Input
            id="register-phone-number"
            type="text"
            placeholder="请输入手机号"
            value={registerForm.phone_number}
            onChange={handleRegisterChange}
            className={cn(errors.registerPhoneNumber && 'border-danger')}
          />
          {errors.registerPhoneNumber && (
            <p className="text-danger text-sm">{errors.registerPhoneNumber}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-username">用户名</Label>
          <Input
            id="register-username"
            type="text"
            placeholder="请输入用户名"
            value={registerForm.userName}
            onChange={handleRegisterChange}
            className={cn(errors.registerUserName && 'border-danger')}
          />
          {errors.registerUserName && (
            <p className="text-danger text-sm">{errors.registerUserName}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-password">密码</Label>
          <Input
            id="register-password"
            type="password"
            placeholder="请设置密码"
            value={registerForm.password}
            onChange={handleRegisterChange}
            className={cn(errors.registerPassword && 'border-danger')}
          />
          {errors.registerPassword && (
            <p className="text-danger text-sm">{errors.registerPassword}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-confirm">确认密码</Label>
          <Input
            id="register-confirm"
            type="password"
            placeholder="请再次输入密码"
            value={registerForm.confirmPassword}
            onChange={handleRegisterChange}
            className={cn(errors.registerConfirm && 'border-danger')}
          />
          {errors.registerConfirm && (
            <p className="text-danger text-sm">{errors.registerConfirm}</p>
          )}
        </div>
        <div className="mt-8 flex">
          <Button
            className="w-full"
            onClick={handleRegisterSubmit}
            disabled={isSubmitting || isSuccess}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? '注册中...' : '注册'}
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [activeTab, setActiveTab] = useState<string>('login');

  // 根据当前 tab 获取标题
  const getTitle = () => {
    return activeTab === 'login' ? '账号登录' : '注册新账号';
  };

  // 处理 tab 变化
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        <TabsDemo onTabChange={handleTabChange} />
      </DialogContent>
    </Dialog>
  );
}
