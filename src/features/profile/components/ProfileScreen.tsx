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
        <Loader2 className="h-8 w-8 text-haldi-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-ink">Account & Profile</h1>
          <p className="text-xs text-ink/60 mt-1">Manage physical stats, calorie goals, and account privacy.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="quiet" size="sm" onClick={handleExportData} disabled={exporting}>
            <Download className="h-4 w-4 mr-1.5" /> {exporting ? 'Exporting...' : 'Export Data (CSV)'}
          </Button>
          <Button variant="quiet" size="sm" onClick={handleSignOut} className="text-chukandar-600 hover:bg-chukandar-50">
            <LogOut className="h-4 w-4 mr-1.5" /> Sign Out
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-patta-50 text-patta-800 border border-patta-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0 text-patta-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-chukandar-50 text-chukandar-700 border border-chukandar-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-chukandar-600" />
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
