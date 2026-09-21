import { useRouter } from 'expo-router';
import { Archive, ArchiveRestore, Copy, Pause, Play } from 'lucide-react-native';
import { Pressable as RNPressable, Text, View } from 'react-native';

import { BottomSheet, useToast } from '@/components/ui';
import { useStore } from '@/store';
import type { Campaign } from '@/types';

export type CampaignActionsSheetProps = {
  campaign: Campaign;
  visible: boolean;
  onClose: () => void;
};

type Action = {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  onPress: () => void;
};

function ActionRow({ icon, label, danger, onPress }: Action) {
  return (
    <RNPressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-4 py-3.5 rounded-md active:opacity-70">
      {icon}
      <Text
        className={`text-body font-medium ${danger ? 'text-danger dark:text-danger-dark' : 'text-primary-text dark:text-primary-text-dark'}`}>
        {label}
      </Text>
    </RNPressable>
  );
}

export function CampaignActionsSheet({ campaign, visible, onClose }: CampaignActionsSheetProps) {
  const { dispatch } = useStore();
  const toast = useToast();
  const router = useRouter();

  const actions: Action[] = [];

  if (campaign.status === 'active' || campaign.status === 'scheduled') {
    actions.push({
      icon: <Pause size={18} color="#D97706" />,
      label: 'Pause campaign',
      onPress: () => {
        dispatch({ type: 'PAUSE_CAMPAIGN', campaignId: campaign.id });
        toast.success('Campaign paused');
        onClose();
      },
    });
  }

  if (campaign.status === 'paused') {
    actions.push({
      icon: <Play size={18} color="#16A34A" />,
      label: 'Resume campaign',
      onPress: () => {
        dispatch({ type: 'RESUME_CAMPAIGN', campaignId: campaign.id });
        toast.success('Campaign resumed');
        onClose();
      },
    });
  }

  actions.push({
    icon: <Copy size={18} color="#69707D" />,
    label: 'Duplicate',
    onPress: () => {
      dispatch({ type: 'DUPLICATE_CAMPAIGN', campaignId: campaign.id });
      toast.success('Campaign duplicated as draft');
      onClose();
    },
  });

  if (campaign.isArchived) {
    actions.push({
      icon: <ArchiveRestore size={18} color="#69707D" />,
      label: 'Restore from archive',
      onPress: () => {
        dispatch({ type: 'UNARCHIVE_CAMPAIGN', campaignId: campaign.id });
        toast.success('Campaign restored');
        onClose();
      },
    });
  } else {
    actions.push({
      icon: <Archive size={18} color="#DC2626" />,
      label: 'Archive campaign',
      danger: true,
      onPress: () => {
        dispatch({ type: 'ARCHIVE_CAMPAIGN', campaignId: campaign.id });
        toast.success('Campaign archived');
        onClose();
        router.replace('/campaigns');
      },
    });
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title={campaign.name}>
      <View className="gap-1">
        {actions.map((a, i) => (
          <ActionRow key={i} {...a} />
        ))}
      </View>
    </BottomSheet>
  );
}