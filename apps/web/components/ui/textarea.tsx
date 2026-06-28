/**
 * Re-export `Textarea` z input.tsx — moduły kreatorów (D7 Ugoda, D8 Upadłość)
 * importują przez `@/components/ui/textarea`. Trzymamy implementację w
 * input.tsx, ponieważ Input i Textarea współdzielą design tokeny i style
 * (institutional field z brand spec §3.4).
 */
export { Textarea, type TextareaProps } from "./input";
