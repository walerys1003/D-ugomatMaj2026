import { z } from "zod";

/**
 * Auth form schemas — single source of truth for client validation,
 * mirrored on the server in route handlers.
 *
 * Polish-language messages are intentional (UI is Polish-first).
 */
export const emailSchema = z
  .string({ required_error: "Podaj e-mail." })
  .trim()
  .toLowerCase()
  .email("To nie wygląda na poprawny e-mail.");

// NIST 800-63B-aligned: length first, complexity second. Spec §15.3.
export const passwordSchema = z
  .string({ required_error: "Podaj hasło." })
  .min(10, "Hasło musi mieć co najmniej 10 znaków.")
  .max(128, "Hasło jest zbyt długie (max 128).")
  .refine((v) => /[A-Z]/.test(v) && /[a-z]/.test(v), "Hasło musi zawierać wielką i małą literę.")
  .refine((v) => /\d/.test(v), "Hasło musi zawierać cyfrę.");

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Podaj hasło."),
  remember: z.boolean().optional(),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirm: z.string(),
    accept: z.literal(true, {
      errorMap: () => ({ message: "Musisz zaakceptować regulamin." }),
    }),
    marketing: z.boolean().optional(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Hasła nie są identyczne.",
    path: ["confirm"],
  });
export type SignUpInput = z.infer<typeof signUpSchema>;

export const magicLinkSchema = z.object({ email: emailSchema });
export type MagicLinkInput = z.infer<typeof magicLinkSchema>;

export const resetPasswordSchema = z.object({ email: emailSchema });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const updatePasswordSchema = z
  .object({ password: passwordSchema, confirm: z.string() })
  .refine((d) => d.password === d.confirm, {
    message: "Hasła nie są identyczne.",
    path: ["confirm"],
  });
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
