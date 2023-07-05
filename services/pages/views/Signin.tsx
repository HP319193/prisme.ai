import SigninForm from '../../console/components/SigninForm';

export const Signin = () => {
  return (
    <div className="flex m-auto">
      <SigninForm onSignin={(user) => {}} />
    </div>
  );
};

export default Signin;
