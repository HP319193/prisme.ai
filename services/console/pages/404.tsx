import Link from 'next/link';
import ErrorsLayout from '../components/ErrorsLayout';

export default function FourOhFour() {
  return (
    <ErrorsLayout>
      <h1>404 - Page Not Found</h1>
      <Link href="/">
        <a>Go back home</a>
      </Link>
    </ErrorsLayout>
  );
}
