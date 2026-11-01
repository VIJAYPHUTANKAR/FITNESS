/**
 * ExerciseLogScreen: Exercise activity tracking screen with date navigation, workout logging form,
 * MET burn preview, and logged workout management. Rendered by src/app/(app)/log/exercise/page.tsx.
 */

'use client';

import { useExerciseLog } from '../hooks/useExerciseLog';
import { ExerciseDateBar } from './ExerciseDateBar';
import { ExerciseForm } from './ExerciseForm';
import { ExerciseLogList } from './ExerciseLogList';

export function ExerciseLogScreen() {
  const {
    loggedOn,
    setLoggedOn,
    exercises,
    logs,
    userWeight,
    loading,
    selectedExerciseId,
    setSelectedExerciseId,
    durationMin,
    setDurationMin,
    submitting,
    error,
    editingId,
    setEditingId,
    editDuration,
    setEditDuration,
    updating,
    changeDate,
    estimatedCalories,
    handleAddExercise,
    handleUpdateLog,
    handleDeleteLog,
    totalBurned,
    totalMinutes,
  } = useExerciseLog();

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 space-y-6">
      <ExerciseDateBar
        loggedOn={loggedOn}
        setLoggedOn={setLoggedOn}
        changeDate={changeDate}
        totalBurned={totalBurned}
        totalMinutes={totalMinutes}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ExerciseForm
          exercises={exercises}
          selectedExerciseId={selectedExerciseId}
          setSelectedExerciseId={setSelectedExerciseId}
          durationMin={durationMin}
          setDurationMin={setDurationMin}
          userWeight={userWeight}
          estimatedCalories={estimatedCalories}
          submitting={submitting}
          error={error}
          onSubmit={handleAddExercise}
        />

        <ExerciseLogList
          logs={logs}
          loading={loading}
          loggedOn={loggedOn}
          editingId={editingId}
          editDuration={editDuration}
          setEditDuration={setEditDuration}
          updating={updating}
          onStartEdit={(id, currDur) => {
            setEditingId(id);
            setEditDuration(currDur);
          }}
          onCancelEdit={() => setEditingId(null)}
          onSaveEdit={handleUpdateLog}
          onDelete={handleDeleteLog}
        />
      </div>
    </div>
  );
}
