import { Link } from 'react-router-dom';
import { ArrowRight, Palette, ShieldCheck, Sparkles } from 'lucide-react';
import { LoginForm } from '@/modules/account/components/LoginForm';
import { Button } from '@/shared/components/ui/button';

export const Login = () => {
  return (
    <div className="my-auto h-full flex-grow bg-white py-12 lg:py-16">
      <div className="content-w m-pad my-auto grid gap-8 lg:grid-cols-2 lg:items-stretch">
        <section className="rounded-lg bg-red-50 p-6 text-slate-950 shadow-xl sm:p-8 lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-700">
              New to ICAF?
            </p>
            <h2 className="font-montserrat text-3xl font-semibold sm:text-4xl">
              Create your account!
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-700"></p>
          </div>

          <div className="mt-8 grid gap-4">
            {[
              {
                icon: <Palette aria-hidden="true" className="h-5 w-5" />,
                target: 'Teachers,',
                text: "Find a lesson plan to spark your students' artistic imagination. Represent your class, school, and country with a group submission to our gallery.",
              },
              {
                icon: <ShieldCheck aria-hidden="true" className="h-5 w-5" />,
                target: 'Parents and Guardians,',
                text: 'Choose a theme to . ',
              },
              {
                icon: <Sparkles aria-hidden="true" className="h-5 w-5" />,
                target: 'Teachers',
                text: 'Stay connected with ICAF programs and updates.',
              },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-start gap-3 text-sm font-semibold leading-6 text-slate-700"
              >
                <span className="text-secondary-blue mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white">
                  {item.icon}
                </span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          <Button
            asChild
            className="hover:bg-secondary-blue mt-8 h-12 rounded-full bg-slate-950 text-base font-bold text-white"
          >
            <Link to="/register">
              Make an account
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </Button>
        </section>

        <section className="flex items-center">
          <LoginForm />
        </section>
      </div>
    </div>
  );
};
