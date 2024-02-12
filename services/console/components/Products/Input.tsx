import {
  CSSProperties,
  useMemo,
  DetailedHTMLProps,
  InputHTMLAttributes,
} from 'react';
import searchIcon from '../../public/images/icon-search.svg';

interface InputProps
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  as?: Extract<keyof JSX.IntrinsicElements, 'input'>;
  search?: boolean;
}

export const Input = ({
  as: As = 'input',
  search,
  className = '',
  ...props
}: InputProps) => {
  const style = useMemo(() => {
    const style: CSSProperties = {};
    if (search) {
      style.backgroundImage = `url('${searchIcon.src}')`;
      style.backgroundRepeat = 'no-repeat';
      style.backgroundPosition = 'left 20px top 50%';
    }
    return style;
  }, [search]);
  return (
    <As
      className={`text-product-text-on-white text-products-base h-[50px] px-[50px] rounded-[5px] outline-none ${className}`}
      style={style}
      {...props}
    />
  );
};

export default Input;
