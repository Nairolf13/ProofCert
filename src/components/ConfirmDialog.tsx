import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmClassName?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  onCancel,
  onConfirm,
  confirmClassName = 'bg-red-600 hover:bg-red-700 text-white',
}) => (
  <Transition.Root show={open} as={React.Fragment}>
    <Dialog as="div" className="relative z-50" onClose={onCancel}>
      <Transition.Child
        as={React.Fragment}
        enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
        leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
      </Transition.Child>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
            leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-2xl transition-all flex flex-col gap-6">
              <Dialog.Title as="h3" className="text-xl font-bold text-primary-700 mb-2">{title}</Dialog.Title>
              {description && <p className="text-gray-700 mb-4">{description}</p>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={onCancel} className="px-4 py-2">{cancelLabel}</Button>
                <Button type="button" variant="primary" onClick={onConfirm} className={`px-4 py-2 ${confirmClassName}`}>{confirmLabel}</Button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition.Root>
);
