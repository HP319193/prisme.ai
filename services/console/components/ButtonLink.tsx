import Link from "next/link"
import { ButtonHTMLAttributes, FC } from "react"

interface ButtonLinkProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
}
export const ButtonLink: FC<ButtonLinkProps> = ({ children, href, ...props }) => {

  return <button style={{ background: 'none', border: 0, cursor: 'pointer', fontSize: 'inherit', ...props.style }} {...props}>
    {href && <Link href={href}><>{children}</></Link>}
    {!href && children}
  </button>
}

export default ButtonLink
