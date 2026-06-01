import React from 'react';

import CameraIcon from '../../../assets/icons/camera.svg';
import CheckIcon from '../../../assets/icons/check.svg';
import CircleIcon from '../../../assets/icons/circle.svg';
import CloseIcon from '../../../assets/icons/close.svg';
import DropHappyIcon from '../../../assets/icons/drop-happy.svg';
import DropSadIcon from '../../../assets/icons/drop-sad.svg';
import EditIcon from '../../../assets/icons/edit.svg';
import FlashOffIcon from '../../../assets/icons/flash-off.svg';
import FlashIcon from '../../../assets/icons/flash.svg';
import GoogleIcon from '../../../assets/icons/google.svg';
import HomeIcon from '../../../assets/icons/home.svg';
import InfoIcon from '../../../assets/icons/info.svg';
import MinusIcon from '../../../assets/icons/minus.svg';
import MoreIcon from '../../../assets/icons/more.svg';
import PlantIcon from '../../../assets/icons/plant.svg';
import PlusIcon from '../../../assets/icons/plus.svg';
import RepeatIcon from '../../../assets/icons/repeat.svg';
import ScheduleIcon from '../../../assets/icons/schedule.svg';
import TrashIcon from '../../../assets/icons/trash.svg';
import WaterIcon from '../../../assets/icons/water.svg';
import { colors } from '../../../theme';

export type IconName =
  | 'camera'
  | 'check'
  | 'circle'
  | 'close'
  | 'dropHappy'
  | 'dropSad'
  | 'edit'
  | 'flash'
  | 'flashOff'
  | 'google'
  | 'home'
  | 'info'
  | 'minus'
  | 'more'
  | 'plant'
  | 'plus'
  | 'repeat'
  | 'schedule'
  | 'trash'
  | 'water';

export type IconProps = {
  color?: string;
  name: IconName;
  size?: IconSize;
};

export type IconSize = 'normal' | 'medium' | 'large' | 'xLarge' | number;

const iconSizes = {
  normal: 24,
  medium: 32,
  large: 40,
  xLarge: 48,
} as const;

const iconComponents: Record<IconName, React.ComponentType<any>> = {
  camera: CameraIcon,
  check: CheckIcon,
  circle: CircleIcon,
  close: CloseIcon,
  dropHappy: DropHappyIcon,
  dropSad: DropSadIcon,
  edit: EditIcon,
  flash: FlashIcon,
  flashOff: FlashOffIcon,
  google: GoogleIcon,
  home: HomeIcon,
  info: InfoIcon,
  minus: MinusIcon,
  more: MoreIcon,
  plant: PlantIcon,
  plus: PlusIcon,
  repeat: RepeatIcon,
  schedule: ScheduleIcon,
  trash: TrashIcon,
  water: WaterIcon,
};

export function Icon({ color = colors.icon.primary, name, size = 24 }: IconProps) {
  const resolvedSize = typeof size === 'number' ? size : iconSizes[size];
  const Component = iconComponents[name];

  return <Component width={resolvedSize} height={resolvedSize} color={color} />;
}
