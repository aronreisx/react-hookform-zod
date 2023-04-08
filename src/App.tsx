import { useState } from 'react';
import './styles/global.css';

import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from './components/Form'
import { PlusCircle, XCircle } from 'lucide-react';

const createUserFormSchema = z.object({
  name: z.string()
    .nonempty('Name is mandatory')
    .transform(transformInitialsCapital),

  email: z.string()
    .nonempty('Email is mandatory')
    .email('Email format is required')
    .refine(email => {
      return email.endsWith('@arx.co')
    }, 'Email must be from arx.co'),

  password: z.string()
    .min(6, 'Must be at least 6 characters'),

  techs: z.array(z.object({
    title: z.string().nonempty('Title is mandatory'),
    knowledge: z.coerce.number().min(1).max(10)
  })).min(2, 'At least two technologies must be added')
})

type CreateUserFormData = z.infer<typeof createUserFormSchema>

function transformInitialsCapital(fullName: string) {
  return fullName.trim().split(' ').map(
    name => name[0].toLocaleUpperCase().concat(name.substring(1))
  ).join(' ');
}

export function App() {
  const [output, setOutput] = useState('');

  const createUserForm = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserFormSchema)
  });

  function createUser(data: CreateUserFormData) {
    setOutput(JSON.stringify(data, null, 2));
  }

  const {
    handleSubmit,
    formState: { isSubmitting },
    watch,
    control,
  } = createUserForm;

  const userPassword = watch('password')
  const isPasswordStrong = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})').test(userPassword)

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'techs',
  })

  function addNewTech() {
    append({ title: '', knowledge: 0 })
  }

  return (
    <main className="h-screen flex flex-row gap-6 items-center justify-center">
      <FormProvider {...createUserForm}>
        <form
          onSubmit={handleSubmit(createUser)}
          className="flex flex-col gap-4 w-full max-w-xs"
        >
          <Form.Field>
            <Form.Label htmlFor="name">
              Name
            </Form.Label>
            <Form.Input type="name" name="name" />
            <Form.ErrorMessage field="name" />
          </Form.Field>

          <Form.Field>
            <Form.Label htmlFor="email">
              Email
            </Form.Label>
            <Form.Input type="email" name="email" />
            <Form.ErrorMessage field="email" />
          </Form.Field>

          <Form.Field>
            <Form.Label htmlFor="password">
              Password

              {isPasswordStrong
                ? <span className="text-xs text-emerald-600">Strong password</span>
                : <span className="text-xs text-red-500">Weak password</span>}
            </Form.Label>
            <Form.Input type="password" name="password" />
            <Form.ErrorMessage field="password" />
          </Form.Field>

          <Form.Field>
            <Form.Label>
              Technologies

              <button
                type="button"
                onClick={addNewTech}
                className="text-emerald-500 font-semibold text-xs flex items-center gap-1"
              >
                Add
                <PlusCircle size={14} />
              </button>
            </Form.Label>
            <Form.ErrorMessage field="techs" />

            {fields.map((field, index) => {
              const fieldName = `techs.${index}.title`

              return (
                <Form.Field key={field.id}>
                  <div className="flex gap-2 items-center">
                    <Form.Input type={fieldName} name={fieldName} />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-500"
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                  <Form.ErrorMessage field={fieldName} />
                </Form.Field>
              )
            })}
          </Form.Field>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-violet-500 text-white rounded px-3 h-10 font-semibold text-sm hover:bg-violet-600"
          >
            Save
          </button>
        </form>
      </FormProvider>
    </main>
  )
}
