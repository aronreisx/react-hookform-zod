import { useState } from 'react';
import './styles/global.css';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

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

function Error({ message = 'Validation error' }: { message?: string }) {
  return (
    <span className='text-red-500 text-sm'>{ message }</span>
  );
}

export function App() {
  const [output, setOutput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserFormSchema)
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'techs'
  })

  function addNewTech() {
    append({ title: '', knowledge: 0 })
  }

  function createUser(data: CreateUserFormData) {
    setOutput(JSON.stringify(data, null, 2));
  }

  return (
    <main className='h-screen bg-zinc-800 text-zinc-300 flex flex-col gap-10 items-center justify-center'>
      <form onSubmit={handleSubmit(createUser)} className='flex flex-col gap-4 w-full max-w-xs'>
        <div className='flex flex-col gap-1'>
          <label htmlFor='name'>Name</label>
          <input
            type='text'
            {...register('name')}
            className='border bg-zinc-700 border-zinc-600 text-white shadow-sm rounded h-10 px-3'
          />
          { errors.name && <Error message={errors.name.message} /> }
        </div>

        <div className='flex flex-col gap-1'>
          <label htmlFor='email'>Email</label>
          <input
            type='email'
            {...register('email')}
            className='border bg-zinc-700 border-zinc-600 text-white shadow-sm rounded h-10 px-3'
          />
          { errors.email && <Error message={errors.email.message} /> }
        </div>

        <div className='flex flex-col gap-1'>
          <label htmlFor='password'>Password</label>
          <input
            type='password'
            {...register('password')}
            className='border bg-zinc-700 border-zinc-600 text-white shadow-sm rounded h-10 px-3'
          />
          { errors.password && <Error message={errors.password.message} /> }
        </div>

        <div className='flex flex-col gap-1'>
          <label
            htmlFor=''
            className='flex items-center justify-between'
          >
            Technologies
            <button
              type='button'
              onClick={addNewTech}
              className='text-emerald-500 text-sm'
            >
              Add
            </button>
          </label>
          {fields.map((field, index) => {
            return (
              <div className='flex gap-2' key={field.id}>
                <div className="flex-1 flex flex-col gap-1">
                  <input
                    type="text"
                    {...register(`techs.${index}.title`)}
                    className="border bg-zinc-700 border-zinc-600 text-white shadow-sm rounded h-10 px-3"
                  />
                  {errors.techs?.[index]?.title && <Error message={errors.techs[index]?.title?.message} /> }
                </div>

                <div className="flex flex-col gap-1">
                  <input
                    type="number"
                    {...register(`techs.${index}.knowledge`)}
                    className="w-16 border bg-zinc-700 border-zinc-600 text-white shadow-sm rounded h-10 px-3"
                  />
                  {errors.techs?.[index]?.knowledge && <Error message={errors.techs[index]?.knowledge?.message} /> }
                </div>

              </div>
            )
          })}

          { errors.techs && <Error message={errors.techs.message} /> }

        </div>

        <button
          type='submit'
          className='bg-emerald-500 rounded font-semibold text-white h-10 hover:bg-emerald-600'
        >
          Save
        </button>
      </form>
      <pre>{output}</pre>
    </main>
  )
}
