/**
 * ProfileScreen: Account settings, physical metrics, weigh-in logging, CSV export, and deletion screen.
 * Rendered by src/app/(app)/profile/page.tsx.
 */

'use client';

import { Download, LogOut, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProfileForm } from './ProfileForm';
import { WeighInCard } from './WeighInCard';
import { DeleteAccountModal } from './DeleteAccountModal';
import { useProfile } from '../hooks/useProfile';

export function ProfileScreen() {
  const {
    loading,
    saving,
    successMsg,
    errorMsg,
    fullName,
    setFullName,
    dob,
    setDob,
    gender,
    setGender,
    heightCm,
    setHeightCm,
    weightKg,
    setWeightKg,
    activityLevel,
    setActivityLevel,
    goalType,
    setGoalType,
    calorieGoal,
    setCalorieGoal,
    newWeight,
    setNewWeight,
    savingWeight,
    userEmail,
    exporting,
    showDeleteModal,
    setShowDeleteModal,
    deleteConfirmationText,
    setDeleteConfirmationText,
    deletingAccount,
    bmr,
    tdee,
    recommendedGoal,
    floor,
    isBelowFloor,
    isDeleteConfirmed,
    handleSaveProfile,
    handleQuickWeightLog,
    handleExportData,
    handleDeleteAccount,
    handleSignOut,
  } = useProfile();

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account & Profile</h1>
          <p className="text-xs text-gray-500 mt-1">Manage physical stats, calorie goals, and account privacy.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleExportData} disabled={exporting}>
            <Download className="h-4 w-4 mr-1.5" /> {exporting ? 'Exporting...' : 'Export Data (CSV)'}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-red-600 hover:bg-red-50">
            <LogOut className="h-4 w-4 mr-1.5" /> Sign Out
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ProfileForm
          fullName={fullName}
          setFullName={setFullName}
          dob={dob}
          setDob={setDob}
          gender={gender}
          setGender={setGender}
          heightCm={heightCm}
          setHeightCm={setHeightCm}
          weightKg={weightKg}
          setWeightKg={setWeightKg}
          activityLevel={activityLevel}
          setActivityLevel={setActivityLevel}
          goalType={goalType}
          setGoalType={setGoalType}
          calorieGoal={calorieGoal}
          setCalorieGoal={setCalorieGoal}
          recommendedGoal={recommendedGoal}
          floor={floor}
          isBelowFloor={isBelowFloor}
          saving={saving}
          onSubmit={handleSaveProfile}
        />

        <div className="space-y-6">
          <WeighInCard
            weightKg={weightKg}
            newWeight={newWeight}
            setNewWeight={setNewWeight}
            savingWeight={savingWeight}
            bmr={bmr}
            tdee={tdee}
            goalType={goalType}
            onQuickWeightLog={handleQuickWeightLog}
          />

          <DeleteAccountModal
            showModal={showDeleteModal}
            setShowModal={setShowDeleteModal}
            userEmail={userEmail}
            confirmationText={deleteConfirmationText}
            setConfirmationText={setDeleteConfirmationText}
            isConfirmed={isDeleteConfirmed}
            deleting={deletingAccount}
            onConfirmDelete={handleDeleteAccount}
          />
        </div>
      </div>
    </div>
  );
}
