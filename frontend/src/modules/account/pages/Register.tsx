import { RegisterForm } from '@/modules/account/components/RegisterForm';

export const Register = () => {
  return (
    <div className="my-auto h-full flex-grow bg-slate-50 py-16">
      <div className="content-w m-pad my-auto">
        <RegisterForm />
      </div>
    </div>
  );
};
