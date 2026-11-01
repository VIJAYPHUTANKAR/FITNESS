/**
 * DeleteAccountModal: Danger zone trigger card and confirmation modal for irreversible account deletion.
 * Rendered inside ProfileScreen.
 */

'use client';

import { ShieldAlert, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DeleteAccountModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  userEmail: string;
  confirmationText: string;
  setConfirmationText: (v: string) => void;
  isConfirmed: boolean;
  deleting: boolean;
  onConfirmDelete: () => void;
}

export function DeleteAccountModal({
  showModal,
  setShowModal,
  userEmail,
  confirmationText,
  setConfirmationText,
  isConfirmed,
  deleting,
  onConfirmDelete,
}: DeleteAccountModalProps) {
  return (
    <>
      {/* Danger Zone: Delete Account */}
      <div className="bg-plate rounded-2xl border border-chukandar-200/80 p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-chukandar-700 font-semibold text-sm">
          <ShieldAlert className="h-5 w-5 text-chukandar-600" />
          <span>Danger Zone</span>
        </div>
        <p className="text-xs text-ink/70 leading-relaxed">
          Permanently delete your profile and all associated food, exercise, weight logs, and saved activity plans. This action cannot be undone.
        </p>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowModal(true)}
          className="w-full"
        >
          <Trash2 className="h-4 w-4 mr-1.5" /> Delete Account
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-plate rounded-2xl p-6 shadow-2xl border border-chukandar-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-chukandar-100 text-chukandar-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-heading font-bold text-ink text-lg">Confirm Account Deletion</h3>
              <p className="text-xs text-ink/70">
                This will permanently delete your account and all records. Type <strong>DELETE</strong> or your email (<strong>{userEmail}</strong>) below to confirm.
              </p>
            </div>

            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={`Type DELETE or ${userEmail || 'your email'}`}
              className="w-full px-3.5 py-2.5 rounded-xl border border-steel-300 bg-plate text-ink text-center font-bold text-sm focus:ring-2 focus:ring-chukandar-500 focus:outline-none"
            />

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="quiet"
                onClick={() => {
                  setShowModal(false);
                  setConfirmationText('');
                }}
                disabled={deleting}
                className="w-1/2"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={onConfirmDelete}
                disabled={!isConfirmed || deleting}
                className="w-1/2"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
