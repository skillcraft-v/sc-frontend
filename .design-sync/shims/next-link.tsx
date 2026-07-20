// design-sync shim: next/link fora do runtime Next vira uma âncora simples.
// Mesma abordagem dos testes do repo (Header.test.tsx mocka next/link).
import * as React from "react";

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string | { pathname?: string };
  children?: React.ReactNode;
};

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, children, ...rest },
  ref,
) {
  const resolved = typeof href === "string" ? href : (href?.pathname ?? "#");
  return (
    <a ref={ref} href={resolved} {...rest}>
      {children}
    </a>
  );
});

export default Link;
