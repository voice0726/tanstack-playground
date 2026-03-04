import * as z from 'zod';

// MODE / DEV / PROD are Vite built-ins and are populated by Vite at runtime.
const envSchema = z.object({
  MODE: z.string().min(1),
  DEV: z.boolean(),
  PROD: z.boolean(),
  VITE_API_BASE_URL: z.url().transform((value) => value.replace(/\/+$/, '')),
});

export type AppEnv = z.infer<typeof envSchema>;

const formatEnvError = (error: z.ZodError): Error => {
  const details = error.issues
    .map((issue) => {
      const key = issue.path.length > 0 ? issue.path.join('.') : '(root)';
      return `- ${key}: ${issue.message}`;
    })
    .join('\n');

  return new Error(`Invalid environment variables:\n${details}`);
};

export const parseEnv = (rawEnv: unknown): AppEnv => {
  const parsed = envSchema.safeParse(rawEnv);

  if (!parsed.success) {
    throw formatEnvError(parsed.error);
  }

  return parsed.data;
};

export const env = parseEnv(import.meta.env);
