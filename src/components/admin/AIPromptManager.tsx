
import React from 'react';
import { usePromptManager } from "@/hooks/usePromptManager";
import PromptHeader from "./prompts/PromptHeader";
import PromptTable from "./prompts/PromptTable";
import EmptyPromptState from "./prompts/EmptyPromptState";
import PromptDialog from "./prompts/PromptDialog";
import DeleteConfirmationDialog from "./prompts/DeleteConfirmationDialog";

const AIPromptManager: React.FC = () => {
  const {
    prompts,
    isLoading,
    error,
    isDialogOpen,
    isDeleteDialogOpen,
    currentPrompt,
    isActivating,
    handleOpenDialog,
    handleCloseDialog,
    handleSavePrompt,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleDeletePrompt,
    handleSetActive
  } = usePromptManager();

  return (
    <div className="space-y-4">
      <PromptHeader onCreateNew={() => handleOpenDialog()} />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">Carregando prompts...</div>
      ) : prompts.length === 0 ? (
        <EmptyPromptState onCreate={() => handleOpenDialog()} />
      ) : (
        <PromptTable
          prompts={prompts}
          isActivating={isActivating}
          onEdit={handleOpenDialog}
          onDelete={handleOpenDeleteDialog}
          onActivate={handleSetActive}
        />
      )}

      {/* Dialog para criar/editar prompt */}
      <PromptDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSavePrompt}
        currentPrompt={currentPrompt}
      />

      {/* Dialog para confirmar exclusão */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeletePrompt}
      />
    </div>
  );
};

export default AIPromptManager;
