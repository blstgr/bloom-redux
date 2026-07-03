import React from 'react';
import { Modal, Pressable, StyleSheet } from 'react-native';

import { colors, radii, sizes, spacing } from '../../../theme';
import { AppText } from '../AppText';
import { Button } from '../Button';
import { Icon } from '../Icon';

export type AlertModalVariant = 'info' | 'error';

export type AlertModalProps = {
  onClose?: () => void;
  text: string;
  variant: AlertModalVariant;
  visible: boolean;
};

export function AlertModal({ onClose, text, variant, visible }: AlertModalProps) {
  const handleClose = React.useCallback(() => {
    onClose?.();
  }, [onClose]);

  return (
    <Modal onRequestClose={handleClose} transparent visible={visible}>
      <Pressable accessible={false} onPress={handleClose} style={styles.backdrop}>
        <Pressable
          accessible={false}
          onPress={event => {
            event.stopPropagation();
          }}
          style={styles.card}>
          <Icon name={variant === 'info' ? 'info' : 'dropSad'} color={colors.icon.inverse} size={sizes.icon.lg} />
          <AppText align="center" tone="inverse" variant="body">
            {text}
          </AppText>
          <Button
            label="Close"
            layout="fill"
            onPress={handleClose}
            size="small"
            variant="secondary"
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: colors.overlay.scrim,
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface.dark,
    borderRadius: radii.photo,
    gap: spacing.xl,
    maxWidth: sizes.modal.maxWidth,
    padding: spacing.xxl,
    width: '100%',
  },
});
