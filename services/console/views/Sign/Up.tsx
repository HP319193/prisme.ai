import { SignLayout, SignType } from '../../components/SignLayout';
import SignupForm from '../../components/SignupForm';
import { useTracking } from '../../components/Tracking';

export const SignIn = () => {
  const { trackEvent } = useTracking();
  return (
    <SignLayout type={SignType.Up} link="signin">
      <SignupForm
        redirect={'/'}
        onSignup={(user, next) => {
          trackEvent({
            category: 'Sign up',
            action: 'New Account Created',
          });
          next();
        }}
      />
    </SignLayout>
  );
};

export default SignIn;
