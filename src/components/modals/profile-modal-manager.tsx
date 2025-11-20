'use client';

import { ProfileModal } from '@/components/modals/profile-modal';
import { useAppStore } from '@/store/useAppStore';

export const ProfileModalManager = () => {
  const open = useAppStore((state) => state.profileModalOpen);
  const close = useAppStore((state) => state.closeProfileModal);
  const completeProfile = useAppStore((state) => state.completeProfile);
  const user = useAppStore((state) => state.user);

  return (
    <ProfileModal
      open={open}
      onClose={close}
      onSaved={completeProfile}
      initialProfile={user}
    />
  );
};
