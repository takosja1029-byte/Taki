import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Trash2, AlertTriangle } from 'lucide-react';

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title = 'Delete Confirmation',
  itemName,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[11000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
        onClick={(e) => {
          e.stopPropagation();
          onCancel();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-gradient-to-b from-red-950 via-zinc-950 to-black border-2 border-red-500/60 rounded-2xl p-6 shadow-[0_0_50px_rgba(220,38,38,0.5)] text-white overflow-hidden select-none"
        >
          {/* Top Decorative Tak Flame Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-red-600 to-amber-500" />

          {/* Header Badge */}
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-red-950/80 border-red-500/50 text-rose-300">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Confirm Action</span>
            </span>

            <span className="text-[11px] text-amber-300/70 font-mono">
              Admin Safety Guard
            </span>
          </div>

          {/* Icon & Title */}
          <div className="flex items-start gap-3.5 mb-4">
            <div className="p-3 rounded-xl shrink-0 bg-red-600/30 text-rose-400 border border-red-500/60">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white">
                {title}
              </h3>
              <p className="text-xs text-rose-200/80 mt-1 leading-relaxed">
                Are you sure you want to delete this item? This action cannot be undone.
              </p>
            </div>
          </div>

          {/* Target Item Name Card */}
          <div className="p-3.5 rounded-xl bg-black/70 border border-red-500/40 text-amber-200 text-sm font-semibold mb-6 break-words flex items-center gap-2.5">
            <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="truncate">{itemName}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCancel();
              }}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-rose-200 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onConfirm();
              }}
              className="px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xl shadow-red-900 border border-red-400"
            >
              <Trash2 className="w-4 h-4" />
              <span>Confirm & Delete</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
