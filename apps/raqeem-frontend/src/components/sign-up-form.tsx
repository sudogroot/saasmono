import { authClient } from '@/lib/auth-client';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import z from 'zod';
import Loader from './loader';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useRouter } from 'next/navigation';
import { Scale, Lock, Mail, User, DoorOpen } from 'lucide-react';
import Image from 'next/image';

export default function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const router = useRouter();
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
        },
        {
          onSuccess: async () => {
            const organization = await authClient.organization.create({
              name: `${value.name}-${value.email}-${Date.now()}`,
              slug: `${value.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
              keepCurrentActiveOrganization: false,
            });

            await authClient.organization.setActive({
              organizationId: organization.data?.id,
            });

            router.push('/dashboard');
            toast.success('Sign up successful');
          },
          onError: error => {
            toast.error(error.error.message || error.error.statusText);
          },
        }
      );
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-2'>
      <div className='w-full max-w-md'>
        <div className='bg-white rounded-2xl shadow-2xl border p-8 space-y-6'>
          {/* Logo and Header */}
          <div className='text-center space-y-4'>
            <div className='flex justify-center'>
              <div className='mb-2 flex items-center justify-center'>
                <Image src='/raqeem-logo.svg' alt='Logo' width={170} height={60} />
              </div>
            </div>
            <div>
              <h1 className='text-2xl font-bold text-gray-900 mb-2'>إنشاء حساب جديد</h1>
              <p className='text-gray-600'>انضم إلى رقيم وابدأ رحلتك القانونية</p>
            </div>
          </div>

          <form
            onSubmit={e => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className='space-y-6'
          >
            <div>
              <form.Field name='name'>
                {field => (
                  <div className='space-y-2'>
                    <Label htmlFor={field.name} className='text-gray-700 font-medium'>
                      الاسم الكامل
                    </Label>
                    <div className='relative'>
                      <User className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
                      <Input
                        id={field.name}
                        name={field.name}
                        placeholder='اكتب اسمك الكامل'
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={e => field.handleChange(e.target.value)}
                        className='pl-10 h-12 border-gray-200 focus:border-primary focus:ring-primary/20 rounded-lg'
                      />
                    </div>
                    {field.state.meta.errors.map(error => (
                      <p key={error?.message} className='text-red-500 text-sm'>
                        {error?.message}
                      </p>
                    ))}
                  </div>
                )}
              </form.Field>
            </div>

            <div>
              <form.Field name='email'>
                {field => (
                  <div className='space-y-2'>
                    <Label htmlFor={field.name} className='text-gray-700 font-medium'>
                      البريد الإلكتروني
                    </Label>
                    <div className='relative'>
                      <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
                      <Input
                        id={field.name}
                        name={field.name}
                        type='email'
                        placeholder='اكتب بريدك الإلكتروني'
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={e => field.handleChange(e.target.value)}
                        className='pl-10 h-12 border-gray-200 focus:border-primary focus:ring-primary/20 rounded-lg'
                      />
                    </div>
                    {field.state.meta.errors.map(error => (
                      <p key={error?.message} className='text-red-500 text-sm'>
                        {error?.message}
                      </p>
                    ))}
                  </div>
                )}
              </form.Field>
            </div>

            <div>
              <form.Field name='password'>
                {field => (
                  <div className='space-y-2'>
                    <Label htmlFor={field.name} className='text-gray-700 font-medium'>
                      كلمة المرور
                    </Label>
                    <div className='relative'>
                      <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
                      <Input
                        id={field.name}
                        name={field.name}
                        type='password'
                        placeholder='اختر كلمة مرور قوية'
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={e => field.handleChange(e.target.value)}
                        className='pl-10 h-12 border-gray-200 focus:border-primary focus:ring-primary/20 rounded-lg'
                      />
                    </div>
                    {field.state.meta.errors.map(error => (
                      <p key={error?.message} className='text-red-500 text-sm'>
                        {error?.message}
                      </p>
                    ))}
                  </div>
                )}
              </form.Field>
            </div>

            <form.Subscribe>
              {state => (
                <Button
                  type='submit'
                  className='w-full h-12 text-lg font-semibold relative hover:from-slate-800 hover:via-slate-600 hover:to-slate-800    bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 text-white border-2 border-slate-600 shadow-xl transform  transition-all duration-300 ease-out  before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%]  before:transition-transform before:duration-700 before:rounded-lg overflow-hidden'
                  disabled={!state.canSubmit || state.isSubmitting}
                >
                  <span className='relative z-10'>
                    {state.isSubmitting ? 'جارٍ إنشاء الحساب...' : 'إنشاء الحساب'}
                  </span>
                </Button>
              )}
            </form.Subscribe>
          </form>

          <div className='text-center'>
            <p className='text-gray-600 mb-2'>لديك حساب بالفعل؟</p>
            <Button
              variant='link'
              onClick={onSwitchToSignIn}
              className='text-primary hover:text-primary/80 font-medium underline'
            >
              <DoorOpen className='mr-1' />
              تسجيل الدخول
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
