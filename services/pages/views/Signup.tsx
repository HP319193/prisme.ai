import { useState } from 'react';
import SignupForm from '../../console/components/SignupForm';
import ValidateForm from '../../console/components/ValidateForm';
import { parse } from 'querystring';

export const Signup = () => {
  const [newUser, setNewUser] = useState<Prismeai.User>();
  const { location } =
    typeof window !== 'undefined'
      ? window
      : {
          location: {
            search: '',
          } as Location,
        };
  const { redirect } = parse(location.search.replace(/^\?/, ''));
  return (
    <div className="flex m-auto">
      {!newUser && (
        <SignupForm onSignup={setNewUser} redirect={`${redirect}`} />
      )}
      {newUser && (
        <div className="flex-col">
          <ValidateForm email={`${newUser.email}`} sent={true} />
        </div>
      )}
    </div>
  );
};

export default Signup;
