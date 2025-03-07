import { SignLayout, SignType } from '../../components/SignLayout';
import SignupForm from '../../components/SignupForm';
import { useTracking } from '../../components/Tracking';

export const SignUp = () => {
  const { trackEvent } = useTracking();
  return (
    <SignLayout type={SignType.Up} link="signin">
      <SignupForm
        redirect={'/'}
        onSignup={(user, next) => {
          trackEvent({
            category: 'Sign up',
            action: 'New Account Created',
            name: 'new account',
            value: user,
          });
          next();
        }}
      />
    </SignLayout>
  );
};

SignUp.isPublic = true;

export default SignUp;
