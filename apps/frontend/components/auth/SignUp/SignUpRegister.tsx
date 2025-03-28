'use client'

import { Button } from '@/components/shadcn/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from '@/components/shadcn/command'
import { Input } from '@/components/shadcn/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/shadcn/popover'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/shadcn/tooltip'
import { majors } from '@/libs/constants'
import { cn, isHttpError, safeFetcher } from '@/libs/utils'
import checkIcon from '@/public/icons/check-white.svg'
import { useSignUpModalStore } from '@/stores/signUpModal'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { CommandList } from 'cmdk'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FaCheck, FaChevronDown, FaEye, FaEyeSlash } from 'react-icons/fa'
import { IoWarningOutline } from 'react-icons/io5'
import { toast } from 'sonner'
import * as v from 'valibot'

interface SignUpFormInput {
  username: string
  email: string
  verificationCode: string
  firstName: string
  lastName: string
  studentId: string
  major: string
  password: string
  passwordAgain: string
}

const FIELD_NAMES = [
  'username',
  'password',
  'passwordAgain',
  'firstName',
  'lastName',
  'studentId',
  'major'
] as const
type Field = (typeof FIELD_NAMES)[number]
const fields: Field[] = [...FIELD_NAMES]

const schema = v.pipe(
  v.object({
    username: v.pipe(
      v.string(),
      v.minLength(1, 'Required'),
      v.regex(/^[a-z0-9]{3,10}$/)
    ),
    password: v.pipe(
      v.string(),
      v.minLength(8, 'Required'),
      v.maxLength(20),
      v.check((data) => {
        const invalidPassword = /^([a-z]*|[A-Z]*|[0-9]*|[^a-zA-Z0-9]*)$/
        return !invalidPassword.test(data)
      })
    ),
    passwordAgain: v.pipe(v.string(), v.minLength(1, 'Required')),
    studentId: v.pipe(
      v.string(),
      v.minLength(1, 'Required'),
      v.regex(/^[0-9]{10}$/, 'only 10 numbers')
    ),
    firstName: v.pipe(
      v.string(),
      v.minLength(1, 'Required'),
      v.regex(/^[가-힣a-zA-Z ]*$/, 'only English and Korean supported')
    ),
    lastName: v.pipe(
      v.string(),
      v.minLength(1, 'Required'),
      v.regex(/^[가-힣a-zA-Z ]*$/, 'only English and Korean supported')
    )
  }),
  v.forward(
    v.partialCheck(
      [['password'], ['passwordAgain']],
      (input) => input.password === input.passwordAgain,
      'Incorrect'
    ),
    ['passwordAgain']
  )
)

export function requiredMessage(message?: string) {
  return (
    <div className="inline-flex items-center text-xs text-red-500">
      {message === 'Required' && <IoWarningOutline />}
      <p className={cn(message === 'Required' && 'pl-1')}>{message}</p>
    </div>
  )
}

export function SignUpRegister() {
  const formData = useSignUpModalStore((state) => state.formData)
  const [passwordShow, setPasswordShow] = useState<boolean>(false)
  const [passwordAgainShow, setPasswordAgainShow] = useState<boolean>(false)
  const [inputFocus, setInputFocus] = useState<number>(0)
  const [focusedList, setFocusedList] = useState<Array<boolean>>([
    true,
    ...Array(7).fill(false)
  ])
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean>(false)
  const [checkedUsername, setCheckedUsername] = useState<string>('')
  const [signUpDisable, setSignUpDisable] = useState<boolean>(false)
  const [majorOpen, setMajorOpen] = React.useState<boolean>(false)
  const [majorValue, setMajorValue] = React.useState<string>('')

  const updateFocus = (n: number) => {
    setInputFocus(n)
    setFocusedList((prevList) =>
      prevList.map((focused, index) => (index === n ? true : focused))
    )
    if (n > 0) {
      trigger(fields[n - 1])
    }
  }

  const {
    handleSubmit,
    register,
    getValues,
    watch,
    trigger,
    formState: { errors, isDirty }
  } = useForm<SignUpFormInput>({
    resolver: valibotResolver(schema),
    defaultValues: {
      username: '',
      password: ''
    },
    shouldFocusError: false
  })

  const watchedPassword = watch('password')
  const watchedPasswordAgain = watch('passwordAgain')

  useEffect(() => {
    if (watchedPasswordAgain) {
      trigger('passwordAgain')
    }
  }, [watchedPassword, watchedPasswordAgain, trigger])

  function onSubmitClick() {
    setInputFocus(0)
    setFocusedList(Array(8).fill(true))
    fields.map((field) => {
      trigger(field)
    })
  }

  const onSubmit = async (data: {
    password: string
    passwordAgain: string
    firstName: string
    lastName: string
    studentId: string
    username: string
  }) => {
    if (
      !(data.username === checkedUsername && isUsernameAvailable) ||
      !majorValue
    ) {
      return
    }
    const fullName = `${data.firstName} ${data.lastName}`
    try {
      setSignUpDisable(true)
      await safeFetcher.post('user/sign-up', {
        headers: {
          ...formData.headers
        },
        json: {
          password: data.password,
          passwordAgain: data.passwordAgain,
          realName: fullName,
          studentId: data.studentId,
          major: majorValue,
          username: data.username,
          email: formData.email,
          verificationCode: formData.verificationCode
        }
      })
      document.getElementById('closeDialog')?.click()
      toast.success('Sign up succeeded!')
    } catch (error) {
      toast.error('Sign up failed!')
      setSignUpDisable(false)
    }
  }
  const validation = async (field: string) => {
    await trigger(field as keyof SignUpFormInput)
  }

  const checkUserName = async () => {
    const username = getValues('username')
    await trigger('username')

    if (errors.username) {
      updateFocus(0)
      return
    }

    try {
      await safeFetcher.get(`user/username-check?username=${username}`)
      setCheckedUsername(username)
      setIsUsernameAvailable(true)
    } catch (error) {
      if (isHttpError(error)) {
        setCheckedUsername(username)
        setIsUsernameAvailable(false)
      }
    }
  }

  const isRequiredError =
    errors.username && errors.username.message === 'Required'
  const isInvalidFormatError =
    errors.username && errors.username.message !== 'Required'
  const isUsernameChecked =
    checkedUsername === getValues('username') && getValues('username')
  const isAvailable =
    !errors.username && isUsernameAvailable && isUsernameChecked
  const isUnavailable =
    !errors.username && !isUsernameAvailable && isUsernameChecked
  const shouldCheckUserId =
    !isUsernameChecked && !errors.username && getValues('username')

  return (
    <div className="mb-5 mt-12 flex w-[278px] flex-col py-4">
      <form
        className="flex w-full flex-col gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Input
              placeholder="User ID"
              className={cn(
                'focus-visible:ring-0',
                focusedList[1] &&
                  getInputBorderClassname(
                    inputFocus === 1,
                    Boolean(errors.username),
                    getValues('username')
                  ),
                !isUsernameAvailable &&
                  getValues('username') &&
                  (checkedUsername === getValues('username') ||
                    inputFocus !== 1) &&
                  'border-red-500 focus-visible:border-red-500'
              )}
              {...register('username', {
                onChange: () => {
                  validation('username')
                  setIsUsernameAvailable(false)
                },
                validate: (value) =>
                  value === checkedUsername && isUsernameAvailable
                    ? true
                    : 'Check user ID'
              })}
              onFocus={() => {
                trigger('username')
                updateFocus(1)
              }}
            />
            <Button
              onClick={() => {
                checkUserName()
              }}
              type="button"
              className={cn(
                ((isUsernameAvailable &&
                  checkedUsername === getValues('username')) ||
                  errors.username) &&
                  'bg-gray-400',
                'flex h-8 w-11 items-center justify-center rounded-full'
              )}
              disabled={Boolean(
                (isUsernameAvailable &&
                  checkedUsername === getValues('username')) ||
                  errors.username
              )}
              size="icon"
            >
              <Image src={checkIcon} alt="check" />
            </Button>
          </div>
          <div className="text-xs">
            {inputFocus !== 1 && (
              <>
                {isRequiredError && requiredMessage('Required')}
                {isInvalidFormatError && (
                  <ul className="list-disc pl-4 text-red-500">
                    <li>User ID used for log in</li>
                    <li>3-10 characters of small letters, numbers</li>
                  </ul>
                )}
                {isAvailable && (
                  <p className="text-xs text-blue-500">Available</p>
                )}
                {isUnavailable && (
                  <p className="text-red-500">This ID is already in use</p>
                )}
                {shouldCheckUserId && (
                  <p className="text-red-500">Check user ID</p>
                )}
              </>
            )}
            {inputFocus === 1 &&
              (!isUsernameAvailable &&
              checkedUsername === getValues('username') &&
              getValues('username') ? (
                <p className="text-red-500">This ID is already in use</p>
              ) : (
                <div
                  className={cn(
                    errors.username && getValues('username')
                      ? 'text-red-500'
                      : 'text-gray-700'
                  )}
                >
                  <ul className="list-disc pl-4">
                    <li>User ID used for log in</li>
                    <li>3-10 characters of small letters, numbers</li>
                  </ul>
                </div>
              ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="relative flex justify-between gap-2">
            <Input
              placeholder="Password"
              className={cn(
                'focus-visible:ring-0',
                focusedList[2] &&
                  getInputBorderClassname(
                    inputFocus === 2,
                    Boolean(errors.password),
                    getValues('password')
                  )
              )}
              {...register('password', {
                onChange: () => validation('password')
              })}
              type={passwordShow ? 'text' : 'password'}
              onFocus={() => {
                updateFocus(2)
              }}
            />
            <span
              className="absolute right-0 top-0 flex h-full p-3"
              onClick={() => setPasswordShow(!passwordShow)}
            >
              {passwordShow ? (
                <FaEye className="text-gray-400" />
              ) : (
                <FaEyeSlash className="text-gray-400" />
              )}
            </span>
          </div>
          {inputFocus === 2 &&
            (errors.password || !getValues('password') ? (
              <div
                className={cn(
                  !getValues('password') ? 'text-gray-700' : 'text-red-500'
                )}
              >
                <ul className="pl-4 text-xs">
                  <li className="list-disc">8-20 characters</li>
                  <li className="list-disc">Include two of the followings:</li>
                  <li>capital letters, small letters, numbers</li>
                </ul>
              </div>
            ) : (
              <p className="text-xs text-blue-500">Available</p>
            ))}
          {inputFocus !== 2 &&
            errors.password &&
            (errors.password.message === 'Required' ? (
              requiredMessage('Required')
            ) : (
              <ul className="pl-4 text-xs text-red-500">
                <li className="list-disc">8-20 characters</li>
                <li className="list-disc">Include two of the followings:</li>
                <li>capital letters, small letters, numbers</li>
              </ul>
            ))}
        </div>

        <div className="flex flex-col gap-1">
          <div className="relative flex justify-between gap-2">
            <Input
              {...register('passwordAgain', {
                onChange: () => validation('passwordAgain')
              })}
              className={cn(
                'focus-visible:ring-0',
                focusedList[3] &&
                  getInputBorderClassname(
                    inputFocus === 3,
                    Boolean(errors.passwordAgain),
                    getValues('passwordAgain')
                  )
              )}
              placeholder="Re-enter password"
              type={passwordAgainShow ? 'text' : 'password'}
              onFocus={() => {
                updateFocus(3)
              }}
            />
            <span
              className="absolute right-0 top-0 flex h-full p-3"
              onClick={() => setPasswordAgainShow(!passwordAgainShow)}
            >
              {passwordAgainShow ? (
                <FaEye className="text-gray-400" />
              ) : (
                <FaEyeSlash className="text-gray-400" />
              )}
            </span>
          </div>
          {errors.passwordAgain &&
            (getValues('passwordAgain') || inputFocus !== 3) &&
            requiredMessage(errors.passwordAgain.message)}
        </div>
        <div className="my-2 border-b" />
        <div className="flex justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Input
              placeholder="First name (이름)"
              {...register('firstName', {
                onChange: () => validation('firstName')
              })}
              className={cn(
                'focus-visible:ring-0',
                focusedList[4] &&
                  getInputBorderClassname(
                    inputFocus === 4,
                    Boolean(errors.firstName),
                    getValues('firstName')
                  )
              )}
              onFocus={() => {
                updateFocus(4)
              }}
            />
            {errors.firstName &&
              (getValues('firstName') || inputFocus !== 4) &&
              requiredMessage(errors.firstName.message)}
          </div>
          <div className="flex flex-col gap-1">
            <Input
              placeholder="Last name (성)"
              {...register('lastName', {
                onChange: () => validation('lastName')
              })}
              className={cn(
                'focus-visible:ring-0',
                focusedList[5] &&
                  getInputBorderClassname(
                    inputFocus === 5,
                    Boolean(errors.lastName),
                    getValues('lastName')
                  )
              )}
              onFocus={() => {
                updateFocus(5)
              }}
            />
            {errors.lastName &&
              (getValues('lastName') || inputFocus !== 5) &&
              requiredMessage(errors.lastName.message)}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Input
            placeholder="Student ID (2024123456)"
            {...register('studentId', {
              onChange: () => validation('studentId')
            })}
            className={cn(
              'focus-visible:ring-0',
              focusedList[6] &&
                getInputBorderClassname(
                  inputFocus === 6,
                  Boolean(errors.studentId),
                  getValues('studentId')
                )
            )}
            onFocus={() => {
              updateFocus(6)
            }}
          />
          {errors.studentId &&
            (getValues('studentId') || inputFocus !== 6) &&
            requiredMessage(errors.studentId.message)}
        </div>
        <div className="flex flex-col gap-1">
          <Popover open={majorOpen} onOpenChange={setMajorOpen} modal={true}>
            <PopoverTrigger asChild>
              <Button
                aria-expanded={majorOpen}
                variant="outline"
                role="combobox"
                onClick={() => {
                  updateFocus(7)
                }}
                className={cn(
                  'justify-between border-gray-200 font-normal text-black',
                  !majorValue
                    ? 'text-gray-500'
                    : 'ring-primary border-0 ring-1',
                  !majorValue &&
                    focusedList[7] &&
                    !majorOpen &&
                    'border-0 ring-1 ring-red-500'
                )}
              >
                <p className="overflow-hidden text-ellipsis whitespace-nowrap">
                  {!majorValue ? 'First Major' : majorValue}
                </p>
                <FaChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command>
                <CommandInput placeholder="Search major..." />
                <ScrollArea className="h-40">
                  <CommandEmpty>No major found.</CommandEmpty>
                  <CommandGroup>
                    <TooltipProvider>
                      <CommandList>
                        {majors?.map((major) => (
                          <Tooltip key={major}>
                            <TooltipTrigger>
                              <CommandItem
                                value={major}
                                onSelect={(currentValue) => {
                                  setMajorValue(currentValue)
                                  setMajorOpen(false)
                                }}
                              >
                                <FaCheck
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    majorValue === major
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                <p className="w-[230px] overflow-hidden text-ellipsis whitespace-nowrap text-left">
                                  {major}
                                </p>
                              </CommandItem>
                            </TooltipTrigger>
                            <TooltipContent className="bg-blue-600">
                              <p>{major}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </CommandList>
                    </TooltipProvider>
                  </CommandGroup>
                </ScrollArea>
              </Command>
            </PopoverContent>
          </Popover>
          {!majorValue &&
            focusedList[7] &&
            !majorOpen &&
            requiredMessage('Required')}
        </div>

        <Button
          disabled={signUpDisable || !isDirty}
          type="submit"
          onClick={onSubmitClick}
        >
          Register
        </Button>
      </form>
    </div>
  )
}

const getInputBorderClassname = (
  isFocus: boolean,
  error: boolean,
  value: string
) => {
  let className = 'border-primary'

  if (error && (value || !isFocus)) {
    className = 'border-red-500 focus-visible:border-red-500'
  }

  return className
}
