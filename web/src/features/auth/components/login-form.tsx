'use client'

import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { getAuthErrorDetails } from '@/features/auth/auth.api'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  loginSchema,
  type LoginFormValues,
} from '@/features/auth/auth.validation'
import { FormAlert } from '@/features/auth/components/form-alert'
import { PasswordInput } from '@/features/auth/components/password-input'
import { Spinner } from '@/components/feedback/loading'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const REMEMBER_ME_KEY = 'compass-remember-me'

export function LoginForm() {
  const { login } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  })

  useEffect(() => {
    form.setValue('remember', localStorage.getItem(REMEMBER_ME_KEY) === '1')
  }, [form])

  async function onSubmit(values: LoginFormValues) {
    setFormError(null)
    localStorage.setItem(REMEMBER_ME_KEY, values.remember ? '1' : '0')

    try {
      await login({ email: values.email, password: values.password })
      toast.success('Signed in successfully')
    } catch (error) {
      const details = getAuthErrorDetails(error)
      setFormError(details.message)
      for (const [field, message] of Object.entries(details.fieldErrors)) {
        form.setError(field as keyof LoginFormValues, { message })
      }
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        {formError && <FormAlert message={formError} />}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="remember"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <label className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  Remember me
                </label>
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="mt-1"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <>
              <Spinner />
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>
    </Form>
  )
}
