import { SignLayout, SignType } from '../../components/SignLayout';
import SignupForm from '../../components/SignupForm';

export const SignIn = () => {
  return (
    <SignLayout type={SignType.Up} link="signin">
      <SignupForm />
    </SignLayout>
  );
};

export default SignIn;
