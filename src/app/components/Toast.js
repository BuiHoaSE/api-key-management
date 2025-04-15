'use client';

import { Fragment } from 'react';
import { Transition } from '@headlessui/react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function Toast({ show, message, type = 'success' }) {
  const styles = {
    success: {
      bg: 'bg-green-50',
      text: 'text-green-800',
      icon: CheckCircleIcon,
      iconColor: 'text-green-600'
    },
    error: {
      bg: 'bg-red-50',
      text: 'text-red-800',
      icon: XCircleIcon,
      iconColor: 'text-red-600'
    }
  };

  const style = styles[type];
  const Icon = style.icon;

  return (
    <Transition
      show={show}
      as={Fragment}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <div className={`${style.bg} rounded-lg p-4 shadow-lg ring-1 ring-black ring-opacity-5 min-w-[300px]`}>
          <div className="flex items-center gap-3">
            <Icon className={`h-5 w-5 ${style.iconColor}`} />
            <p className={`text-sm font-medium ${style.text}`}>{message}</p>
          </div>
        </div>
      </div>
    </Transition>
  );
} 