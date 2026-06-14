import * as z from 'zod';

export const authUserSchema = z.object({
  id: z.number().int().positive(),
  email: z.email(),
  displayName: z.string().min(1),
});

export const authResponseSchema = z.object({
  user: authUserSchema,
});

export const loginRequestSchema = z.object({
  email: z.email({ error: 'メールアドレスの形式で入力してください' }).trim(),
  password: z.string().min(1, 'パスワードを入力してください'),
});

export type AuthUser = z.infer<typeof authUserSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
