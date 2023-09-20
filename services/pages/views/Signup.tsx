import { useState } from 'react';
import SignupForm from '../../console/components/SignupForm';
import ValidateForm from '../../console/components/ValidateForm';

export const Signup = () => {
  const [newUser, setNewUser] = useState<Prismeai.User>();

  return (
    <div className="flex m-auto">
      {!newUser && <SignupForm onSignup={setNewUser} />}
      {newUser && (
        <div className="flex-col">
          <ValidateForm email={`${newUser.email}`} sent={true} />
        </div>
      )}
    </div>
  );
};

export default Signup;
